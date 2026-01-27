# Session Handoff - January 26, 2026
**Status:** BLOCKER - GitHub Deployment Feature Broken

---

## 🚨 CRITICAL ISSUE

**Problem:** Git clone fails during SSH deployment with "fatal: could not read Username for 'https://github.com': terminal prompts disabled"

**Impact:** Customers cannot deploy code from GitHub (core feature broken)

**Location:** `controllers/serverController.js` line 251 (deploy function)

**Error Stack:**
```
Command failed (exit 128): Cloning into 'simple-static-website'...
fatal: could not read Username for 'https://github.com': terminal prompts disabled
    at Channel.<anonymous> (/home/deploy/server-ui/controllers/serverController.js:417:18)
```

---

## 🔍 WHAT WE TRIED (ALL FAILED)

### Attempt 1: Disable Interactive Prompts
```javascript
// Added GIT_TERMINAL_PROMPT=0
GIT_TERMINAL_PROMPT=0 git clone ${gitUrl}
```
**Result:** Still asked for credentials

### Attempt 2: Disable Credential Helper
```javascript
// Added credential.helper disable
git config --global credential.helper '' && GIT_TERMINAL_PROMPT=0 git clone ${gitUrl}
```
**Result:** SAME ERROR (just deployed to production, still fails)

**Current Code (controllers/serverController.js:251):**
```javascript
await execSSH(conn, `cd /root && rm -rf ${repoName} && git config --global credential.helper '' && GIT_TERMINAL_PROMPT=0 git clone ${gitUrl}`);
```

---

## 🎯 ROOT CAUSE ANALYSIS

**Why it's failing:**
- Public GitHub repos via HTTPS shouldn't need authentication
- But git is STILL trying to authenticate interactively
- Terminal prompts disabled because we're executing via SSH2 library (non-interactive)
- Credential helper disable didn't work

**Possible reasons:**
1. Git credential helper config persists globally on server
2. HTTPS URLs trigger authentication prompt regardless of settings
3. GitHub changed behavior for anonymous cloning
4. SSH2 library environment doesn't fully support git operations

---

## 🧩 MISSING CONTEXT FOR NEXT AGENT

### The execSSH Helper Function (serverController.js:~400-420)
```javascript
function execSSH(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      // Collects stdout/stderr
      // Rejects on non-zero exit code
      // Returns stdout string on success
      // Line 417 throws: reject(new Error(`Command failed (exit ${code}): ${stderr}`))
    });
  });
}
```
**Key:** Non-interactive execution - no terminal for git to prompt user input

### Full Deployment Pipeline (What Happens After Git Clone)
```
Step 1: Clone repo (LINE 251 - CURRENTLY FAILING)
Step 2: Detect project type (package.json? requirements.txt? index.html?)
Step 3: Install dependencies (npm install OR pip install)
Step 4: Build if needed (npm run build for React/Vue)
Step 5: Copy to /var/www/html (nginx serves this)
```
**Key:** Can't test later steps until Step 1 works

### Why HTTPS Fails But SSH Should Work
- HTTPS: `https://github.com/user/repo.git` → Git thinks it needs authentication, prompts for username/password
- SSH: `git@github.com:user/repo.git` → Uses SSH key (no password needed for public repos)
- Public repos accessible via SSH without any credentials IF:
  - GitHub's SSH fingerprint is in `~/.ssh/known_hosts`
  - SSH client doesn't prompt for interactive confirmation

### Testing Strategy
1. **Test manually FIRST** on existing droplet (basement-16-1769469631411)
2. SSH in, try: `ssh-keyscan github.com >> ~/.ssh/known_hosts`
3. Then try: `git clone git@github.com:user/repo.git`
4. If that works, THEN update cloud-init script
5. If that fails, try Option D (tarball download)

### URL Conversion Approach
Users paste HTTPS URLs in dashboard, we need to convert:
```
Input:  https://github.com/bmorelli25/simple-static-website.git
Output: git@github.com:bmorelli25/simple-static-website.git
```
Pattern: Replace `https://github.com/` with `git@github.com:`

---

## 💡 SUGGESTED FIX

**Option A: Use Git Over SSH (Recommended)**
Change GitHub URLs from HTTPS to SSH format:
```javascript
// Before
https://github.com/user/repo.git

// After  
git@github.com:user/repo.git
```

**Pros:**
- No authentication needed for public repos
- Standard approach for server deployments
- Works without credential helper

**Cons:**
- Requires SSH key setup on droplet
- Need to accept GitHub's SSH fingerprint first time

**Implementation Changes:**
1. **Cloud-init (services/digitalocean.js:18-50):** Add after apt-get install:
   ```bash
   ssh-keyscan github.com >> /root/.ssh/known_hosts
   ```
2. **Deploy function (controllers/serverController.js:251):** Convert HTTPS → SSH URL, then:
   ```javascript
   git clone git@github.com:user/repo.git
   ```
3. **Test manually first** on existing droplet before changing cloud-init

**Option B: Pre-configure Git Credential Cache**
Set git credential cache to empty before ANY git operations:
```bash
git config --system credential.helper ''
git config --global credential.helper ''
```
**Change:** Add to cloud-init script, run ONCE on droplet creation (not per-clone)

**Option C: Use SSH Agent Forwarding**
Forward SSH agent through connection to use host's git credentials.
**Note:** Complex setup, not recommended for customer droplets

**Option D: Download & Extract Tarball**
Instead of git clone, download GitHub's tarball:
```bash
wget https://github.com/user/repo/archive/refs/heads/main.tar.gz
tar -xzf main.tar.gz
mv repo-main repo  # rename to match expected folder name
```
**Implementation:** Parse `user/repo` from GitHub URL, construct tarball URL
**Caveat:** Assumes main branch (could be master, develop, etc.)

---

## 📊 CURRENT STATE

### Production Server
- **IP:** 68.183.203.226
- **Service:** cloudedbasement.service (systemd)
- **Code Version:** 22e4001 (LATEST - just deployed)
- **Status:** Running but deployment feature broken

### Test Environment
- **Droplet:** basement-16-1769469631411
- **SSH:** root@[IP] (password: VVQtTfXcpeX0wPaDDPy9w!@#)
- **Git Installed:** Yes (via cloud-init)
- **Test Repo:** https://github.com/bmorelli25/simple-static-website.git

### Code Files Changed (This Session)
1. **services/digitalocean.js** - Fixed cloud-init script
   - Enabled SSH password authentication
   - Fixed bash variable interpolation (single → double quotes)
   - Added git to apt-get install

2. **controllers/serverController.js** - Deployment logic
   - Line 251: Git clone command (credential helper disable)
   - Line 445-447: Database type casting (::text)
   - Added deployment deletion feature

### Git Commits (Chronological)
- `366a58a` - Fix SSH password authentication in cloud-init
- `4cc7acd` - Fix bash variable interpolation
- `37e68a5` - Add git installation, fix database type casting
- `092e535` - Add GIT_TERMINAL_PROMPT=0
- `22e4001` - Disable git credential helper (CURRENT - DOESN'T WORK)

---

## 🔧 DEBUGGING COMMANDS

### Check Git Config on Droplet
```bash
ssh root@[SERVER_IP] "git config --list --show-origin"
```

### Test Git Clone Manually
```bash
ssh root@[SERVER_IP] "cd /root && GIT_TERMINAL_PROMPT=0 git clone https://github.com/bmorelli25/simple-static-website.git test-clone"
```

### Check GitHub SSH Access
```bash
ssh root@[SERVER_IP] "ssh -T git@github.com"
```

### View Deployment Logs
```bash
ssh deploy@68.183.203.226 "sudo journalctl -u cloudedbasement.service -f | grep DEPLOY"
```

---

## 📁 RELEVANT CODE LOCATIONS

### Deploy Function (controllers/serverController.js:200-430)
```javascript
exports.deploy = async (req, res) => {
  // Line 251: GIT CLONE COMMAND (BROKEN)
  await execSSH(conn, `cd /root && rm -rf ${repoName} && git config --global credential.helper '' && GIT_TERMINAL_PROMPT=0 git clone ${gitUrl}`);
  
  // Line 417: ERROR THROWN HERE
  reject(new Error(`Command failed (exit ${code}): ${stderr}`));
};
```

### Cloud-Init Script (services/digitalocean.js:18-50)
```javascript
const setupScript = `#!/bin/bash
# Set root password
echo "root:${password}" | chpasswd

# Enable password authentication for SSH
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
systemctl restart sshd

# Install Git, Nginx and Certbot
apt-get update
apt-get install -y git nginx certbot python3-certbot-nginx
`;
```

### Database Type Casting Fix (controllers/serverController.js:445-447)
```javascript
await pool.query(
  'UPDATE deployments SET output = $1::text, status = $2::text, deployed_at = CASE WHEN $2 = \'success\' THEN NOW() ELSE deployed_at END WHERE id = $3',
  [output, status, deploymentId]
);
```

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Try SSH Git URL** (fastest to test):
   - Parse user input: convert `https://github.com/user/repo.git` → `git@github.com:user/repo.git`
   - Add to cloud-init: `ssh-keyscan github.com >> /root/.ssh/known_hosts`
   - Test clone with SSH URL

2. **If SSH fails, try tarball download**:
   - Extract user/repo from GitHub URL
   - Download: `wget https://github.com/user/repo/archive/refs/heads/main.tar.gz`
   - Extract: `tar -xzf main.tar.gz`
   - Rename folder to expected name

3. **If still fails, debug git directly**:
   - SSH into test droplet
   - Run git clone commands manually
   - Check what's actually blocking it

---

## 📋 TEST REPOSITORIES

- **Static HTML:** https://github.com/bmorelli25/simple-static-website.git
- **React:** https://github.com/gitname/react-gh-pages.git
- **Node.js:** https://github.com/bradtraversy/node_passport_login.git

---

## 🔑 CREDENTIALS

**Production Server:**
- SSH: `ssh deploy@68.183.203.226`
- Service: `sudo systemctl restart cloudedbasement.service`
- Logs: `sudo journalctl -u cloudedbasement.service -f`

**Test Droplet:**
- IP: In user's dashboard (basement-16-1769469631411)
- Username: root
- Password: VVQtTfXcpeX0wPaDDPy9w!@#

**Database:**
- Host: localhost (on production server)
- Name: basement_db
- User: basement_user
- Password: [in .env file]

---

## 🚫 WHAT DOESN'T WORK

- ❌ `GIT_TERMINAL_PROMPT=0` alone
- ❌ `git config --global credential.helper ''`
- ❌ Combination of both
- ❌ HTTPS GitHub URLs in general (all fail)

---

## ✅ WHAT DOES WORK

- ✅ SSH authentication to droplets (password-based)
- ✅ Git is installed on droplets
- ✅ Cloud-init script executes successfully
- ✅ Nginx serving files
- ✅ Database saves deployment records
- ✅ Deployment status polling
- ✅ Deployment deletion feature

---

## 📖 DOCUMENTATION UPDATES NEEDED

After fix is working:
1. Update `HANDOFF-PROMPT.md` with deployment solution
2. Update `docs/TESTING-GUIDE.md` with deployment test steps
3. Update `README.md` to mark deployment feature as complete
4. Remove references to manual server provisioning

---

## 💬 OWNER NOTES

- User has been patient through 3 server re-provisions
- User tested manually: SSH works, git installed, but deployment fails
- User wants next agent to have full context without asking questions
- Critical path: Get deployment working → Test database setup → Launch to customers

---

## 🎬 REPRODUCTION STEPS

1. Login to dashboard: https://cloudedbasement.ca/dashboard
2. Paste test repo: `https://github.com/bmorelli25/simple-static-website.git`
3. Click "Deploy from Git"
4. Watch it fail with "terminal prompts disabled" error

---

**Last Updated:** January 26, 2026 (end of session)
**Next Agent:** Start with Option A (SSH URLs) or Option D (tarball download)
**Expected Time to Fix:** 30-60 minutes if using SSH URLs
