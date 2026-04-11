# Clouded Basement - Comprehensive Codebase Audit

**Generated:** April 2026  
**Project:** Clouded Basement  
**Stack:** Express.js, PostgreSQL, Stripe, DigitalOcean, React (SPA)

---

## Table of Contents

1. [All API Routes](#1-all-api-routes)
2. [All Database Tables](#2-all-database-tables)
3. [All React Dashboard Sections](#3-all-react-dashboard-sections)
4. [All Services](#4-all-services)
5. [All Controllers](#5-all-controllers)
6. [All Middleware](#6-all-middleware)
7. [All Background Jobs](#7-all-background-jobs)
8. [All External Integrations](#8-all-external-integrations)
9. [All Payment Plans](#9-all-payment-plans)
10. [All Deployment Types](#10-all-deployment-types)
11. [All Email Features](#11-all-email-features)
12. [All Security Features](#12-all-security-features)
13. [All Admin Features](#13-all-admin-features)
14. [All Specialized Features](#14-all-specialized-features)

---

## 1. All API Routes

### Authentication Routes (routes/auth.js)

#### Registration & Login
- **GET `/register`** - Serve React SPA for registration page
- **POST `/register`** - Handle user registration with email/password, bot verification code, email/password validation
- **GET `/login`** - Serve React SPA for login page
- **POST `/login`** - Handle user login with credentials, return 401 if invalid
- **GET `/logout`** / **POST `/logout`** - Destroy session, clear cookie
- **GET `/api/auth/bot-challenge`** - Generate 6-char bot verification code for registration form

#### Google OAuth
- **GET `/auth/google`** - Redirect to Google OAuth consent screen (scope: profile, email)
- **GET `/auth/google/callback`** - Handle Google OAuth callback, create/update user, set session

#### Email Verification
- **GET `/confirm-email/:token`** - Verify email confirmation token (24hr expiry), mark email as confirmed
- **GET `/verify-email`** - Serve email verification code entry form
- **POST `/verify-email`** - Verify 6-digit code from email, confirm account
- **POST `/resend-code`** - Resend verification code (returns JSON), generates new code with 15min expiry
- **GET `/resend-confirmation`** - Initiate resend of confirmation email from query param email address

#### Two-Factor Authentication (TOTP)
- **GET `/auth/2fa/prompt`** - Serve 2FA entry form during login
- **POST `/auth/2fa/verify-login`** - Verify TOTP code at login, mark session as 2FA-verified
- **GET `/auth/2fa/setup`** - Generate TOTP secret, QR code, return as JSON
- **POST `/auth/2fa/verify`** - Verify setup TOTP code, enable 2FA, save secret to DB
- **POST `/auth/2fa/disable`** - Disable 2FA for user, clear secret from DB

#### Password Reset
- **GET `/forgot-password`** - Serve password reset form
- **POST `/forgot-password`** - Generate reset token (1hr expiry), send via email
- **GET `/reset-password/:token`** - Verify reset token valid, serve form
- **POST `/reset-password/:token`** - Update password, clear reset token

### Pages & Content Routes (routes/pages.js)

#### Public Pages (all served by React SPA)
- **GET `/about`** - About page
- **GET `/compare`** - Compare plans page
- **GET `/contact`** - Contact page
- **GET `/docs`** - Documentation page
- **GET `/faq`** - FAQ page
- **GET `/pricing`** - Pricing page
- **GET `/privacy`** - Privacy policy
- **GET `/terms`** - Terms of service
- **GET `/is-this-safe`** - Security/safety information page

#### API Endpoints
- **GET `/api/csrf-token`** - Return CSRF token for Contact form
- **GET `/api/pricing/status`** - Return user login/trial status for pricing page banner
- **POST `/api/contact`** - Submit contact form (rate-limited 5/hour), validate name/email/message

### Dashboard Routes (routes/dashboard.js)

#### Dashboard UI
- **GET `/dashboard`** - Serve React dashboard SPA (auth required)

#### User Actions
- **POST `/submit-ticket`** - Submit support ticket
- **POST `/change-password`** - Change user password
- **POST `/apply-updates`** - Apply server updates
- **POST `/dashboard/dismiss-next-steps`** - Dismiss onboarding next steps banner

#### Dashboard APIs
- **GET `/api/dashboard`** - Fetch full dashboard data (servers, deployments, stats)
- **GET `/api/credentials`** - Fetch SSH/DB credentials (encrypted, on-demand)
- **GET `/api/env-vars`** - List environment variables for deployed sites
- **POST `/api/env-vars`** - Create new environment variable
- **DELETE `/api/env-vars/:id`** - Delete environment variable
- **GET `/api/metrics`** - Fetch server metrics from DigitalOcean (proxied through server)
- **GET `/api/deployment-status/:id`** - Poll deployment progress

#### Getting Started
- **GET `/getting-started`** - Serve getting started guide
- **POST `/resend-confirmation`** - Resend email confirmation from within getting-started

### Server Management Routes (routes/servers.js)

#### Server Lifecycle
- **POST `/server-action`** - Start/stop/restart server (maps to DO API: power_on/power_off/reboot)
- **POST `/delete-server`** - Cancel subscription, power off/destroy droplet, soft-delete record

#### Deployments
- **POST `/deploy`** - Create new deployment from Git URL (GitHub/GitLab/Bitbucket/Codeberg/SourceHut), validate URL, check site limits
- **POST `/rollback`** - Rollback to previous deployment
- **POST `/delete-deployment`** - Delete deployment record

#### Domains
- **POST `/add-domain`** - Add custom domain to server (creates DNS record)
- **POST `/delete-domain`** - Remove custom domain (deletes DNS record)

#### SSL/TLS
- **POST `/enable-ssl`** - Manually trigger SSL provisioning via Certbot

#### Auto-Deploy (GitHub Webhooks)
- **POST `/enable-auto-deploy`** - Set up GitHub auto-deploy webhook URL for server
- **POST `/disable-auto-deploy`** - Disable auto-deploy, remove webhook
- **POST `/enable-domain-autodeploy`** - Enable per-domain auto-deploy
- **POST `/disable-domain-autodeploy`** - Disable per-domain auto-deploy

#### Database
- **POST `/setup-database`** - Install PostgreSQL or MongoDB, create database/credentials

#### Provisioning
- **POST `/start-trial`** - Create trial server (3-day free, CPU/RAM/storage limited)

### Payment Routes (routes/payments.js)

#### Checkout
- **GET `/pay`** - Serve Stripe checkout page, show plan/price/features

#### Payment Results
- **GET `/payment-success`** - Handle Stripe success redirect, create payment record, redirect to onboarding
- **GET `/payment-cancel`** - Handle Stripe cancel redirect

#### Payment APIs
- **POST `/create-payment-intent`** - Create Stripe Payment Intent for checkout
- **POST `/upgrade-plan`** - Change subscription plan (Stripe API)

#### Webhooks
- **POST `/webhook/stripe`** - Receive Stripe events (subscription updated, invoice paid, etc.), update DB

### WordPress Routes (routes/wordpress.js)

#### WordPress Site Management
- **POST `/wordpress/create`** - Create new WordPress site on user's server (rate-limited 5/hour)
- **GET `/wordpress/status/:siteId`** - Poll WordPress provisioning status
- **GET `/wordpress/credentials/:siteId`** - Get decrypted WordPress admin credentials

### Onboarding Routes (routes/onboarding.js)

#### Post-Payment Flow
- **GET `/onboarding/choose`** - Show choice page (Node.js vs WordPress)
- **POST `/onboarding/provision-nodejs`** - Create Node.js server after payment (rate-limited)

### Getting Started Routes (routes/gettingStarted.js)

#### Setup Guide
- **GET `/getting-started`** - Show setup guide (auth required)
- **POST `/resend-confirmation`** - Resend email confirmation (auth required)

### Admin Routes (routes/admin.js) - All require `requireAuth` + `requireAdmin`

#### Dashboard
- **GET `/admin`** - Admin dashboard (users, servers, domains, deployments, payments)
- **POST `/admin/delete-user/:id`** - Delete user account and related records
- **POST `/admin/cancel-provisioning/:id`** - Cancel pending server provisioning
- **POST `/admin/delete-server/:id`** - Delete server record
- **POST `/admin/destroy-droplet/:id`** - Destroy DigitalOcean droplet

#### Server Updates Management
- **GET `/admin/updates`** - Show updates dashboard (status dashboard, kill switch)
- **GET `/admin/updates/:id`** - Show update detail view
- **POST `/admin/updates/create`** - Create new update (draft status)
- **POST `/admin/updates/kill-switch`** - Toggle global kill switch (disables all auto-updates)
- **POST `/admin/updates/:id/test`** - Test update on single server
- **POST `/admin/updates/:id/release`** - Release update for customers
- **POST `/admin/updates/:id/push`** - Push update to all servers
- **POST `/admin/updates/:id/retry`** - Retry failed servers
- **POST `/admin/updates/:id/archive`** - Archive update
- **POST `/admin/updates/:id/delete`** - Delete update (draft/archived only)

#### Domain Management (Admin)
- **GET `/admin/domains/list`** - List all domains
- **POST `/admin/domains`** - Add domain (admin override)
- **PUT `/admin/domains/:id`** - Update domain
- **DELETE `/admin/domains/:id`** - Delete domain

### GitHub Webhooks

#### Auto-Deploy Webhooks
- **POST `/webhook/github/:serverId`** - Server-wide auto-deploy webhook (push event)
- **POST `/webhook/github/:serverId/:domainId`** - Per-domain auto-deploy webhook (push event)

### Infrastructure

#### Health Check
- **GET `/health`** - Database connectivity check (returns JSON with status)

#### Sitemap
- **GET `/sitemap.xml`** - XML sitemap for SEO

#### Static Files & SPA
- **GET `/*`** - Serve React SPA fallback (404 page)

---

## 2. All Database Tables

### Core User Tables

#### `users`
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE NOT NULL)
- `password_hash` (VARCHAR)
- `email_confirmed` (BOOLEAN DEFAULT FALSE)
- `email_token` (VARCHAR, 24hr expiry)
- `token_expires_at` (TIMESTAMP)
- `role` (VARCHAR: 'user'|'admin')
- `disabled` (BOOLEAN DEFAULT FALSE)
- `twofa_enabled` (BOOLEAN DEFAULT FALSE)
- `twofa_secret` (VARCHAR, base32 encoded)
- `reset_token` (VARCHAR, 1hr expiry)
- `reset_token_expires` (TIMESTAMP)
- `trial_used` (BOOLEAN DEFAULT FALSE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Server & Deployment Tables

#### `servers`
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER FK users.id ON DELETE CASCADE)
- `plan` (VARCHAR: 'basic'|'pro'|'premium')
- `status` (VARCHAR: 'pending'|'provisioning'|'running'|'stopped'|'deleted'|'failed')
- `hostname` (VARCHAR)
- `ip_address` (INET)
- `ipv6_address` (VARCHAR)
- `droplet_id` (INTEGER, DigitalOcean droplet ID)
- `droplet_name` (VARCHAR, e.g., "basement-user-123-1234567890000")
- `ssh_username` (VARCHAR, default 'root')
- `ssh_password` (BYTEA, encrypted with IV)
- `ssh_password_iv` (BYTEA, encryption IV)
- `site_limit` (INTEGER: 2|5|10 based on plan)
- `stripe_subscription_id` (VARCHAR, Stripe subscription ID if paid)
- `stripe_customer_id` (VARCHAR)
- `auto_deploy_enabled` (BOOLEAN DEFAULT FALSE)
- `github_webhook_secret` (VARCHAR, HMAC secret for GitHub webhook)
- `postgres_installed` (BOOLEAN DEFAULT FALSE)
- `postgres_db_name` (VARCHAR)
- `postgres_db_user` (VARCHAR)
- `postgres_db_password` (BYTEA, encrypted)
- `mongodb_installed` (BOOLEAN DEFAULT FALSE)
- `mongodb_db_name` (VARCHAR)
- `server_type` (VARCHAR: 'nodejs'|'wordpress')
- `cancelled_at` (TIMESTAMP, when deleted)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `deployments`
- `id` (SERIAL PRIMARY KEY)
- `server_id` (INTEGER FK servers.id ON DELETE CASCADE)
- `user_id` (INTEGER FK users.id ON DELETE CASCADE)
- `git_url` (VARCHAR, GitHub/GitLab/etc repo URL)
- `branch` (VARCHAR, target branch)
- `commit_sha` (VARCHAR, last deployed commit)
- `status` (VARCHAR: 'pending'|'building'|'deploying'|'success'|'failed')
- `output` (TEXT, deployment log)
- `deployed_at` (TIMESTAMP)
- `subdomain` (VARCHAR, e.g., "my-app-user123")
- `dns_record_id` (VARCHAR, for cleaning up DNS)
- `deployment_type` (VARCHAR: 'nodejs'|'static'|'wordpress')
- `is_preview` (BOOLEAN DEFAULT FALSE, for non-main branch deploys)
- `preview_subdomain` (VARCHAR, for preview deploys)
- `linked_domain` (VARCHAR, if deployed to custom domain)
- `environment_variables` (JSONB, env vars for this deployment)
- `created_at` (TIMESTAMP)

### Domain Tables

#### `domains`
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER FK users.id ON DELETE CASCADE)
- `server_id` (INTEGER FK servers.id ON DELETE CASCADE)
- `domain` (VARCHAR UNIQUE NOT NULL)
- `name` (VARCHAR)
- `status` (VARCHAR: 'active'|'pending'|'failed')
- `provider` (VARCHAR: 'hostinger'|'godaddy'|etc)
- `ssl_enabled` (BOOLEAN DEFAULT FALSE)
- `ssl_expires_at` (TIMESTAMP)
- `verified` (BOOLEAN DEFAULT FALSE, DNS verified pointing to server)
- `auto_deploy_enabled` (BOOLEAN DEFAULT FALSE)
- `git_url` (VARCHAR, repo to deploy to this domain)
- `webhook_secret` (VARCHAR, HMAC secret for per-domain webhook)
- `renewal_date` (DATE)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Environment Variables

#### `environment_variables`
- `id` (SERIAL PRIMARY KEY)
- `server_id` (INTEGER FK servers.id ON DELETE CASCADE)
- `user_id` (INTEGER FK users.id ON DELETE CASCADE)
- `name` (VARCHAR NOT NULL)
- `value` (TEXT, encrypted)
- `value_iv` (BYTEA, encryption IV)
- `is_encrypted` (BOOLEAN DEFAULT TRUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Payment & Billing

#### `payments`
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER FK users.id ON DELETE CASCADE)
- `stripe_payment_id` (VARCHAR UNIQUE)
- `stripe_customer_id` (VARCHAR)
- `amount` (INTEGER, in cents)
- `currency` (VARCHAR: 'USD'|'CAD')
- `plan` (VARCHAR: 'basic'|'pro'|'premium')
- `payment_interval` (VARCHAR: 'monthly'|'yearly')
- `status` (VARCHAR: 'pending'|'succeeded'|'failed')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Admin & Audit

#### `admin_audit_log`
- `id` (SERIAL PRIMARY KEY)
- `admin_id` (INTEGER FK users.id)
- `action` (VARCHAR: 'delete_user'|'cancel_provisioning'|'destroy_droplet'|etc)
- `target_user_id` (INTEGER FK users.id)
- `target_server_id` (INTEGER FK servers.id)
- `details` (JSONB)
- `created_at` (TIMESTAMP)

#### `security_events`
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER FK users.id ON DELETE CASCADE)
- `event_type` (VARCHAR: 'login'|'logout'|'failed_login'|'2fa_enabled'|'2fa_disabled'|'password_reset'|'api_key_created'|etc)
- `ip_address` (INET)
- `user_agent` (TEXT)
- `details` (JSONB)
- `created_at` (TIMESTAMP)

### WordPress Sites

#### `wordpress_sites`
- `id` (SERIAL PRIMARY KEY)
- `server_id` (INTEGER FK servers.id ON DELETE CASCADE)
- `user_id` (INTEGER FK users.id ON DELETE CASCADE)
- `site_title` (VARCHAR)
- `admin_email` (VARCHAR)
- `admin_username` (VARCHAR, usually 'admin')
- `admin_password` (BYTEA, encrypted)
- `admin_password_iv` (BYTEA, encryption IV)
- `status` (VARCHAR: 'provisioning'|'running'|'failed')
- `wordpress_url` (VARCHAR, e.g., https://domain.com/wp-admin)
- `db_name` (VARCHAR)
- `db_user` (VARCHAR)
- `db_password` (BYTEA, encrypted)
- `db_password_iv` (BYTEA, encryption IV)
- `provisioning_output` (TEXT, installation log)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Server Updates (Admin)

#### `server_updates`
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR NOT NULL)
- `description` (TEXT)
- `script` (TEXT NOT NULL, bash script to execute)
- `type` (VARCHAR: 'config'|'security'|'feature'|'script')
- `version` (VARCHAR)
- `is_critical` (BOOLEAN DEFAULT FALSE)
- `auto_apply` (BOOLEAN DEFAULT FALSE)
- `script_hash` (VARCHAR, immutable hash for verification)
- `status` (VARCHAR: 'draft'|'tested'|'released'|'archived')
- `created_by` (INTEGER FK users.id)
- `created_at` (TIMESTAMP)

#### `server_update_log`
- `id` (SERIAL PRIMARY KEY)
- `server_id` (INTEGER FK servers.id ON DELETE CASCADE)
- `update_id` (INTEGER FK server_updates.id ON DELETE CASCADE)
- `status` (VARCHAR: 'pending'|'success'|'failed')
- `output` (TEXT, execution output)
- `applied_at` (TIMESTAMP)
- `applied_by` (VARCHAR: 'user'|'admin'|'auto')
- UNIQUE(server_id, update_id)

#### `server_update_tests`
- `id` (SERIAL PRIMARY KEY)
- `update_id` (INTEGER FK server_updates.id ON DELETE CASCADE)
- `test_server_id` (INTEGER FK servers.id)
- `status` (VARCHAR: 'pending'|'running'|'success'|'failed')
- `output` (TEXT)
- `tested_at` (TIMESTAMP)

#### `system_settings`
- `id` (SERIAL PRIMARY KEY)
- `key` (VARCHAR UNIQUE)
- `value` (TEXT)
- `updated_at` (TIMESTAMP)
- `updated_by` (INTEGER FK users.id)
- Examples: `updates_kill_switch` (true|false), `updates_rate_limit` (5)

### Uptime Monitoring

#### `uptime_checks`
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER FK users.id ON DELETE CASCADE)
- `target_url` (VARCHAR)
- `check_interval_seconds` (INTEGER, default 300 = 5min)
- `timeout_ms` (INTEGER, default 8000)
- `enabled` (BOOLEAN DEFAULT TRUE)
- `created_at` (TIMESTAMP)

#### `uptime_status`
- `id` (SERIAL PRIMARY KEY)
- `check_id` (INTEGER FK uptime_checks.id ON DELETE CASCADE)
- `is_up` (BOOLEAN)
- `response_ms` (INTEGER)
- `status_code` (INTEGER)
- `error_message` (TEXT)
- `checked_at` (TIMESTAMP)
- Last status cached for alert deduplication

### Session Management

#### `session` (created by connect-pg-simple)
- `sid` (VARCHAR PRIMARY KEY, session ID)
- `sess` (JSONB, session data)
- `expire` (TIMESTAMP, session expiry)

---

## 3. All React Dashboard Sections

### Dashboard Structure (react-homepage/src/pages/dashboard/)

#### Layout Components
- **DashboardLayout.jsx** - Main layout wrapper, navigation

#### Sidebar
- **Sidebar.jsx** - Navigation sidebar with sections:
  - Overview
  - Sites
  - Deploy
  - Dev Tools
  - Settings

#### Dashboard Sections (react-homepage/src/pages/dashboard/sections/)

1. **OverviewSection.jsx**
   - Server status card (running/stopped/provisioning)
   - Plan info (Basic/Pro/Premium)
   - IP address display
   - Trial status
   - Quick actions (start/stop/restart)
   - Uptime stats

2. **SitesSection.jsx**
   - List of deployed sites with subdomain links
   - Deployment status (success/failed/building)
   - Quick deploy button
   - Site management (delete, rollback)
   - Custom domain list

3. **DeploySection.jsx**
   - Git repository URL input (with validation)
   - Branch selector
   - Deployment history
   - Log viewer
   - Deploy/rollback buttons
   - Auto-deploy webhook status

4. **DevToolsSection.jsx**
   - SSH credentials display (copy to clipboard)
   - Database credentials (click to reveal)
   - Node.js PM2 status
   - Environment variables editor
   - Database management tools
   - Server logs viewer

5. **EnvSection.jsx**
   - Environment variable manager
   - Add/edit/delete variables
   - Encryption status
   - Per-deployment env vars

6. **SettingsSection.jsx**
   - Change password
   - 2FA setup/disable
   - Plan upgrade/downgrade
   - Cancel subscription
   - Account deletion (with confirmation)
   - Export data

### Frontend Pages (react-homepage/src/pages/)

- **About.jsx** - About the service
- **Compare.jsx** - Plan comparison
- **Contact.jsx** - Contact form
- **DashboardPage.jsx** - Dashboard SPA wrapper
- **Docs.jsx** - Documentation
- **Faq.jsx** - FAQ
- **Login.jsx** - Login form + 2FA entry
- **Pricing.jsx** - Pricing plans with billing toggle (monthly/yearly)
- **Privacy.jsx** - Privacy policy
- **Register.jsx** - Registration form with bot challenge
- **Safety.jsx** - Safety/security info
- **Terms.jsx** - Terms of service

---

## 4. All Services

### 1. **aiDiagnosis.js**
- **analyzeDeploymentFailure(error, serverEnv)** - Use Claude API to diagnose deployment failures
- Returns human-readable error explanation and suggested fixes
- Integrated into deployment failure emails

### 2. **auditLog.js**
- **logAdminAction(adminId, action, targetUserId, targetServerId, details)** - Log admin actions to audit table
- Used for compliance and detecting unauthorized changes

### 3. **autoSSL.js**
- **checkAndProvisionSSL()** - Runs every 5 minutes
  - Query domains without SSL
  - Check DNS resolution (A record must point to server IP)
  - SSH into server and run `certbot` to provision Let's Encrypt certificate
  - Update database with SSL status and expiry
- **checkDomainAndProvision(domainRecord)** - Check single domain
- **provisionSSLCertificate(domainRecord)** - SSH execution of certbot

### 4. **dailyBackups.js**
- **runDailyBackups()** - Runs once daily (24hr interval)
  - Query all Premium plan servers (those with backup subscriptions)
  - Create DigitalOcean snapshot backups
  - Log backup status, timestamps
  - Email admin on backup failures

### 5. **digitalocean.js**
- **createRealServer(userId, plan, stripeChargeId, paymentInterval, stripeSubscriptionId)**
  - Call DigitalOcean API to create droplet with:
    - Specs matching plan (1GB/2GB/4GB RAM, 1-2 vCPU, 25-80GB storage)
    - Setup script (Nginx, Certbot, Node.js 20, nvm, Git, Go, Rust, ufw firewall)
    - SSH auth enabled, root login allowed, password set
  - Return droplet info: ID, IP, password
- **syncDigitalOceanDroplets()** - Runs hourly
  - Fetch all droplets from DO API
  - Sync status with local database (running/off/error)
  - Update IP addresses if changed
  - Clean up failed droplets
- **destroyDroplet(dropletId)** - Call DO API to destroy droplet completely
- **cleanupPolls()** - Clear polling intervals on graceful shutdown
- Rate limits: MAX_ACTIVE_POLLS = 50 (prevent DoS)

### 6. **dns.js**
- **generateSubdomain(repoName, userId)** - Create Vercel-style subdomain (e.g., "my-app-user123")
- **createDNSRecord(subdomain, ipAddress)** - Create DNS A record pointing to server IP
- **deleteDNSRecord(recordId)** - Remove DNS record on domain deletion
- Supports DigitalOcean DNS or other providers

### 7. **email.js**
- **sendEmail(to, subject, htmlBody, textBody, throwOnError)** - Primary send function
- **sendConfirmationEmail(email, confirmationCode)** - Send 6-digit verification code (24hr expiry)
- **sendWelcomeEmail(email)** - Send welcome email after registration
- **sendDeployErrorEmail(userEmail, deploymentId, errorOutput, aiDiagnosis)** - Send deployment failure with AI analysis
- **sendPasswordResetEmail(email, resetLink)** - Send 1hr reset link
- **sendTrialEndingEmail(email, serverId)** - Send 24hr trial warning
- **sendUptimeAlertEmail(email, url, status)** - Send alert when site goes down or comes back up
- **sendServerReadyEmail(email, serverId, specs)** - Send "server ready" notification
- **sendServerReadyEmail(email, serverDetails)** - Notification when provisioning complete
- Providers: SendGrid, Gmail OAuth2, Mailtrap, SMTP (fallback)
- CAN-SPAM compliant with footer including address, unsubscribe link

### 8. **googleAuth.js**
- **initializeGoogleAuth()** - Configure Passport.js Google OAuth2 strategy
  - Client ID/secret from env
  - Callback URL: `/auth/google/callback`
  - Profile/email scopes
- **Local user upsert on OAuth login** - Create user if first-time login, update if exists
- Export: `passport`, `initializeGoogleAuth`

### 9. **scriptValidator.js**
- **validateScript(scriptContent)** - Check bash script for dangerous commands
  - Block: `rm -rf /`, `dd`, format commands, etc.
  - Return: { valid, error }
- **hashScript(scriptContent)** - Generate immutable SHA256 hash of script
- **verifyScriptHash(script, hash)** - Verify script hasn't been modified
- **ensureSafetyHeaders(script)** - Add shebang, error handling to script

### 10. **serverUpdates.js**
- **isKillSwitchActive()** - Check global kill switch setting
- **setKillSwitch(active, userId)** - Toggle kill switch
- **getRateLimit()** - Get concurrent execution limit (default 5)
- **getAllUpdates()** - Fetch all updates with aggregated stats (success/failure/missing counts)
- **getEligibleTestServers()** - Get running servers for testing
- **testUpdateOnServer(updateId, serverId)** - Execute update script on single server, log output
- **releaseUpdate(updateId)** - Change status from 'tested' → 'released'
- **pushUpdateToAll(updateId)** - Execute on all eligible servers (rate-limited, send emails on failure)
- **retryFailedServers(updateId)** - Re-execute on servers where update failed
- **createUpdate(title, description, script, type, isCritical)** - Create draft update, validate script
- **SSH execution with timeouts:** 30s connect, 5min execution max, 50KB output limit

### 11. **sslVerification.js**
- **reconcileAllSSLStates()** - Runs every 30 minutes
  - Check all domains with SSL enabled
  - Query Certbot on server for actual cert status
  - Reconcile DB state with server reality
  - Update expiry dates
  - Alert on expiry (30/7/1 day before)
- Prevents orphaned/stale SSL records

### 12. **subscriptionMonitor.js**
- **monitorSubscriptions()** - Runs every 6 hours
  - Check expired trials (>3 days, unpaid) → power off droplet
  - Check failed/cancelled Stripe subscriptions → power off droplet
  - After 7 days stopped → destroy droplet completely
  - Send admin/user notifications
- **powerOffDroplet(dropletId)** - Call DO API to stop droplet
- **destroyDroplet(dropletId, serverId)** - Permanently delete droplet, soft-delete server record

### 13. **trialService.js**
- **isTrialAvailable(userId)** - Check if user hasn't used trial (no paid subscriptions)
- **createTrialServer(userId)** - Provision free trial server (3-day expiry)
- Used during `/start-trial` route

### 14. **uptimeMonitor.js**
- **checkUptimeStatus()** - Runs every 5 minutes
  - Collect all deployed subdomains + verified custom domains
  - Ping each HTTPS URL (8s timeout, max 10 concurrent)
  - Record response status + time
  - Send alerts on down→up transitions (never repeat alerts)
  - Email user on status changes
- **getUptimeStatusForUser(userId)** - Get current uptime % for user's sites

### 15. **wordpress.js**
- **createWordPressServer(userId, plan, siteTitle, adminEmail)** - Provision WordPress
  - Create DO droplet with WordPress + MySQL setup script
  - Generate random passwords
  - Return credentials encrypted
  - Async installation monitoring
- Integrates with deployment system

---

## 5. All Controllers

### 1. **authController.js**

**Registration**
- `handleRegister` - POST /register: Validate bot code, email, password (8+ chars), create user, send confirmation email
- `confirmEmail` - GET /confirm-email/:token: Verify token, mark email confirmed
- `resendConfirmation` - GET /resend-confirmation: Resend confirmation email

**Login/Logout**
- `handleLogin` - POST /login: Validate credentials, check 2FA requirement, set session
- `handleLogout` - GET/POST /logout: Destroy session

**Google OAuth**
- Handled in `routes/auth.js` callback

**Email Verification**
- `showVerifyEmail` - GET /verify-email: Show code entry form
- `verifyEmailCode` - POST /verify-email: Verify 6-digit code, activate account
- `resendCode` - POST /resend-code: Resend code (returns JSON)

**Two-Factor Auth (TOTP)**
- `show2FASetup` - GET /auth/2fa/setup: Generate secret, QR code
- `verify2FASetup` - POST /auth/2fa/verify: Verify TOTP, enable 2FA
- `disable2FA` - POST /auth/2fa/disable: Disable 2FA
- `verify2FALogin` - POST /auth/2fa/verify-login: Verify TOTP at login
- `show2FAPrompt` - GET /auth/2fa/prompt: Show TOTP entry form during login

**Password Reset**
- `showForgotPassword` - GET /forgot-password: Show password reset form
- `handleForgotPassword` - POST /forgot-password: Generate 1hr token, send reset link
- `showResetPassword` - GET /reset-password/:token: Show new password form
- `handleResetPassword` - POST /reset-password/:token: Update password, validate token

### 2. **dashboardController.js**

- `getDashboardData` - GET /api/dashboard: Return user's server info, deployments, stats, uptime
- `getCredentials` - GET /api/credentials: Return SSH credentials (decrypt on-demand)
- `getEnvVars` - GET /api/env-vars: List environment variables
- `createEnvVar` - POST /api/env-vars: Create environment variable
- `deleteEnvVar` - DELETE /api/env-vars/:id: Delete environment variable
- `getMetrics` - GET /api/metrics: Proxy DigitalOcean metrics through server (prevent API key exposure)
- `getDeploymentStatus` - GET /api/deployment-status/:id: Poll deployment status
- `submitSupportTicket` - POST /submit-ticket: Create support ticket in DB
- `changePassword` - POST /change-password: Update user password (verify old password first)
- `applyUpdates` - POST /apply-updates: Apply server update to user's servers

### 3. **serverController.js**

**Server Actions**
- `serverAction` - POST /server-action: Start/stop/restart server (calls DO API)
- `deleteServer` - POST /delete-server: Cancel subscription, destroy droplet, soft-delete record

**Deployments**
- `deploy` - POST /deploy: Create new deployment from Git URL
  - Validation: Git URL whitelist (GitHub, GitLab, Bitbucket, Codeberg, SourceHut)
  - SSH into server, clone repo, build, start app
  - Generate subdomain, create DNS record
  - Return deployment ID for polling
  - Async execution, email user on failure
- `rollback` - POST /rollback: Revert to previous deployment
- `deleteDeployment` - POST /delete-deployment: Delete deployment record, remove DNS

**Domains**
- `addDomain` - POST /add-domain: Add custom domain to server, create DNS record
- `deleteDomain` - POST /delete-domain: Remove custom domain, delete DNS record

**SSL**
- `enableSSL` - POST /enable-ssl: Manually trigger Certbot provisioning

**Auto-Deploy**
- `enableDomainAutoDeploy` - POST /enable-domain-autodeploy: Set up per-domain GitHub webhook
- `disableDomainAutoDeploy` - POST /disable-domain-autodeploy: Remove webhook
- `triggerAutoDeploy` - Internal: SSH deployment triggered by webhook
- `triggerDomainAutoDeploy` - Internal: Deploy to specific domain via webhook
- `triggerPreviewDeploy` - Internal: Deploy non-main branch as preview

**Database**
- `setupDatabase` - POST /setup-database: Install PostgreSQL or MongoDB, create database

**Provisioning**
- `startTrial` - POST /start-trial: Create 3-day trial server

### 4. **paymentController.js**

- `showCheckout` - GET /pay: Render Stripe checkout page, show plan/pricing
- `createPaymentIntent` - POST /create-payment-intent: Create Stripe Payment Intent
- `upgradePlan` - POST /upgrade-plan: Change subscription plan via Stripe
- `paymentSuccess` - GET /payment-success: Handle Stripe success redirect, create payment record, redirect to onboarding
- `paymentCancel` - GET /payment-cancel: Handle Stripe cancel redirect
- `stripeWebhook` - POST /webhook/stripe: Receive Stripe events (invoice paid, subscription.updated, etc.)

### 5. **wordpressController.js**

- `createSite` - POST /wordpress/create: Create WordPress site
  - Validate plan, site title, admin email
  - Check 1 active server per user limit
  - Kick off async provisioning
  - Return 202 with site ID for polling
- `getSiteStatus` - GET /wordpress/status/:siteId: Poll provisioning status
- `getWpCredentials` - GET /wordpress/credentials/:siteId: Return decrypted admin credentials

### 6. **onboardingController.js**

- `showChoice` - GET /onboarding/choose: Show Node.js vs WordPress choice page
  - Guard: check payment, check no existing server
  - Display plan info
- `provisionNodejs` - POST /onboarding/provision-nodejs: Create Node.js server after payment

### 7. **gettingStartedController.js**

- `showGettingStarted` - GET /getting-started: Show setup guide (auth required)
- `resendConfirmation` - POST /resend-confirmation: Resend email confirmation from guide

### 8. **adminController.js**

- `listUsers` - GET /admin: Admin dashboard
  - Show users, servers, domains, deployments, payments, pending requests
  - Aggregated stats
- `deleteUser` - POST /admin/delete-user/:id: Delete user account + related records
- `deleteServer` - POST /admin/delete-server/:id: Soft-delete server
- `destroyDroplet` - POST /admin/destroy-droplet/:id: Hard-delete DigitalOcean droplet
- `cancelProvisioning` - POST /admin/cancel-provisioning/:id: Stop pending server provisioning

### 9. **adminUpdatesController.js**

- `showUpdates` - GET /admin/updates: Updates dashboard
  - Show all updates with status badges
  - Kill switch status
  - Quick create button
- `showUpdateDetail` - GET /admin/updates/:id: Update detail view
  - Show script, test results, deployment log
- `createUpdate` - POST /admin/updates/create: Create new update (draft)
- `toggleKillSwitch` - POST /admin/updates/kill-switch: Enable/disable kill switch
- `testUpdate` - POST /admin/updates/:id/test: Test on single server
- `releaseUpdate` - POST /admin/updates/:id/release: Change to 'released'
- `pushUpdate` - POST /admin/updates/:id/push: Execute on all servers
- `retryFailedServers` - POST /admin/updates/:id/retry: Retry failures
- `archiveUpdate` - POST /admin/updates/:id/archive: Archive update
- `deleteUpdate` - POST /admin/updates/:id/delete: Delete draft/archived

### 10. **domainController.js**

- `showDomainManagement` - GET /domains/manage: Show domain management page
- `listDomains` - GET /admin/domains/list: List all domains (admin)
- `addDomain` - POST /admin/domains: Add domain (admin)
- `updateDomain` - PUT /admin/domains/:id: Update domain (admin)
- `deleteDomain` - DELETE /admin/domains/:id: Delete domain (admin)

### 11. **pagesController.js**

- `getPricingStatus` - GET /api/pricing/status: Return login/trial status for pricing page
- `submitContactJson` - POST /api/contact: Handle contact form submission (JSON)

### 12. **githubWebhookController.js**

- `githubWebhook` - POST /webhook/github/:serverId (± :domainId): Handle GitHub push events
  - Verify webhook signature (HMAC SHA256)
  - Detect branch (main vs other)
  - Trigger production deploy (main) or preview deploy (other branch)
  - Support per-domain webhooks
- `enableAutoDeploy` - POST /enable-auto-deploy: Set up webhook
- `disableAutoDeploy` - POST /disable-auto-deploy: Remove webhook

---

## 6. All Middleware

### 1. **auth.js**
- `requireAuth(req, res, next)` - Check session.userId, redirect to login if missing
  - Special handling for API requests (return 401 JSON)
- `requireAdmin(req, res, next)` - Always query DB for user role (no cache, prevent cache poisoning)
  - Verify role === 'admin'
  - Redirect to dashboard if not admin

### 2. **csrf.js**
- **Double Submit Cookie pattern** (csrf-csrf v4)
- `csrfProtection(req, res, next)` - Main middleware
  - Generate CSRF token, attach to `req.csrfToken()`
  - Verify CSRF token in request headers or body
  - Check: X-CSRF-Token, CSRF-Token, X-XSRF-Token, body._csrf
  - Return 403 if token invalid
- **Prod:** __Host-csrf prefix, secure + httpOnly cookies, HTTPS enforced
- **Dev:** plain 'csrf-secret' name, HTTP allowed

### 3. **rateLimiter.js**
- `generalLimiter` - 300 non-GET requests per 15min (skip GET to allow browsing)
- `contactLimiter` - 5 contact form submissions per hour
- `paymentLimiter` - 10 payment attempts per 15min
- `emailVerifyLimiter` - 5 verification attempts per hour
- `deploymentLimiter` - 5 deployments per hour per user (by user ID)
- `loginLimiter` - 8 login attempts per 15min per IP
- `registrationLimiter` - 5 registrations per hour per IP
- `twoFALimiter` - 10 2FA attempts per 15min per IP

### 4. **errorHandler.js**
- Centralized error handling middleware
- Log errors to Sentry for monitoring
- Return appropriate HTTP status codes + error messages
- Hide sensitive error details in production

### 5. **logger.js**
- Request logging middleware
- Log HTTP method, path, status, response time
- Use for debugging and performance monitoring

### 6. **index.js Application Middleware Stack** (order critical)
1. Sentry initialization (must be first)
2. Helmet CSP headers (security)
3. Trust proxy (for Nginx reverse proxy)
4. General rate limiter (all routes)
5. Request logger
6. CSP nonce generator (must be before Helmet)
7. Helmet security headers (with CSP directives)
8. Static file serving (public/, React dist/)
9. Cookie parser
10. URL form parser
11. **Stripe webhook (BEFORE express.json() for raw body)**
12. **GitHub webhook (with raw body capture)**
13. express.json() (general JSON parsing)
14. Session middleware (database-backed)
15. Passport initialization
16. HTTPS redirect (prod only)
17. Route handlers
18. 404 handler
19. Error handler (must be last)

---

## 7. All Background Jobs

All run on timers in [index.js](index.js), defined via `setInterval()` after migrations complete:

### 1. **DigitalOcean Sync** (syncDigitalOceanDropletsService)
- **Interval:** Every 60 minutes
- **Startup delay:** 30 seconds
- **Function:** Sync droplet status (running/off/error), update IP addresses, clean up failed droplets
- **Cleanup:** `cleanupPolls()` on SIGINT/SIGTERM to prevent memory leaks

### 2. **Subscription Monitor** (monitorSubscriptions)
- **Interval:** Every 6 hours
- **Startup delay:** 60 seconds
- **Function:** Check expired trials (>3 days unpaid) → power off, check failed payments → power off, check 7+ days stopped → destroy
- **Sends emails:** Admin notification on trial expiry/destruction

### 3. **Auto-SSL Provisioning** (checkAndProvisionSSL)
- **Interval:** Every 5 minutes
- **Startup delay:** 2 minutes
- **Function:** Query domains without SSL, check DNS resolution, SSH and run certbot to provision Let's Encrypt certificate
- **Automatic:** No user action required

### 4. **SSL State Reconciliation** (reconcileAllSSLStates)
- **Interval:** Every 30 minutes
- **Startup delay:** 3 minutes
- **Function:** Verify actual SSL cert status on servers, update DB, check expiry dates (30/7/1 day alerts)
- **Prevents:** Orphaned/stale SSL records

### 5. **Daily Backups** (runDailyBackups)
- **Interval:** Every 24 hours
- **Startup delay:** 5 minutes
- **Function:** Query Premium servers, create DigitalOcean snapshots, log status
- **Alert:** Email admin on snapshot failure

### 6. **Uptime Monitoring** (checkUptimeStatus)
- **Interval:** Every 5 minutes
- **Startup delay:** 4 minutes
- **Function:** Ping all deployed subdomains + verified custom domains, record status, send alerts on status changes (no spam)
- **Concurrency:** Max 10 concurrent pings

### 7. **Database Migrations** (runMigrations)
- **Timing:** Runs ONCE on server startup (before listening)
- **Function:** Apply pending migrations from migrations/ folder
- **Blocking:** Server won't start if migrations fail

---

## 8. All External Integrations

### 1. **Stripe (Payment Processing)**
- **Use:** Subscription billing, payment collection
- **Endpoints:**
  - POST /webhook/stripe - Receive Stripe events (subscription.created, invoice.paid, etc.)
  - POST /create-payment-intent - Create payment intent for checkout
  - POST /upgrade-plan - Change plan
- **Events handled:**
  - `invoice.paid` → Update payment status
  - `customer.subscription.updated` → Update plan billing
  - `customer.subscription.deleted` → Detect cancellation
- **Pricing:** Basic ($15/mo), Pro ($35/mo), Premium ($65/mo) in cents (USD/CAD)
- **Webhook signature verification:** HMAC SHA256
- **Features:** Monthly/yearly billing, 10% yearly discount, early-adopter locked pricing

### 2. **DigitalOcean (Cloud Infrastructure)**
- **Use:** Droplet provisioning, management, snapshots
- **API Endpoints:**
  - POST /v2/droplets - Create droplet
  - POST /v2/droplets/:id/actions - Power on/off/reboot
  - DELETE /v2/droplets/:id - Destroy droplet
  - POST /v2/snapshots - Create snapshot (backups)
  - GET /v2/regions - List regions
- **Setup:** OAuth token stored in env (DIGITALOCEAN_TOKEN)
- **Droplet specs:** 1GB/2GB/4GB RAM, 1-2vCPU, 25-80GB NVMe SSD
- **Setup script:** Automated Nginx, Certbot, Node.js 20, nvm, Git, Go, Rust, UFW firewall installation
- **Rate limiting:** Max 50 concurrent polling operations
- **SSH auth:** Username/password enabled, root login allowed, password encrypted in DB

### 3. **GitHub (Auto-Deployment)**
- **Use:** Webhook auto-deploy on git push
- **Webhook:** POST /webhook/github/:serverId (± :domainId)
- **Events:** push event only
- **Signature verification:** HMAC SHA256 (X-Hub-Signature-256)
- **Branch support:** Main/master → production, other branches → preview deploy
- **Features:**
  - Per-server auto-deploy on specific Git URL
  - Per-domain auto-deploy (multiple repos to one server)
  - Preview deployments (non-main branches)
- **Supported platforms:** GitHub, GitLab, Bitbucket, Codeberg, SourceHut

### 4. **Google OAuth (Authentication)**
- **Use:** Social login
- **Flow:** GET /auth/google → Google → GET /auth/google/callback (code exchange) → redirect to /dashboard if admin, else /admin
- **Scopes:** profile, email
- **Features:** Auto-create user on first login, upsert on subsequent logins
- **Session:** Set userId, userEmail, userRole, emailConfirmed in session

### 5. **Claude AI (Error Diagnosis)**
- **Use:** Analyze deployment failures, generate human-readable explanations
- **Integration:** services/aiDiagnosis.js
- **When called:** After deployment failure, before sending error email
- **Output:** Suggestions for fix, context about error
- **SDK:** @anthropic-ai/sdk

### 6. **Email Services (Multi-Provider Fallback)**

**SendGrid (Priority)**
- Provider: @sendgrid/mail
- Configured: SENDGRID_API_KEY

**Gmail OAuth2**
- Provider: Gmail SMTP with OAuth2 refresh token
- Configured: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_EMAIL
- Port: 465 (secure) or 587

**Mailtrap (Dev/Test)**
- Provider: SMTP
- Configured: MAILTRAP_USER, MAILTRAP_PASS
- Fallback to: smtp://mailtrap.io:2525

**Generic SMTP**
- Fallback for custom SMTP servers
- Configured: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

**Features:**
- CAN-SPAM compliant (physical address footer: Toronto, ON Canada)
- HTML + plain text variants
- Unsubscribe links
- All systems use Nodemailer with multi-provider support

### 7. **Sentry (Error Monitoring)**
- **Use:** Capture production errors, performance monitoring
- **Initialization:** Sentry.init() at startup (must be first)
- **Configured:** SENTRY_DSN
- **Features:**
  - Transaction tracing (100% sampling)
  - CPU/memory profiling (100% sampling)
  - Automatic error reporting
  - Session replay tracking
- **Environment:** NODE_ENV based (production vs development)

### 8. **PostgreSQL (Database)**
- **Use:** Primary data store
- **Connection:** pg module, pooled connection (connect-pg-simple for sessions)
- **Features:**
  - Session table for express-session
  - Support for full-text search (future)
  - JSON/JSONB for flexible data
  - Encryption at application layer (SSH passwords, DB credentials, env vars)

---

## 9. All Payment Plans

### Current Plans (Pricing)

| Plan      | RAM | vCPU | Storage | Sites | Monthly | Yearly  | Status  |
|-----------|-----|------|---------|-------|---------|---------|---------|
| **Basic** | 1GB | 1    | 25GB    | 2     | $15     | $162    | Active  |
| **Pro**   | 2GB | 2    | 60GB    | 5     | $35     | $378    | Active  |
| **Premium** | 4GB | 2  | 80GB    | 10    | $65     | $702    | Active  |

**Pricing Notes:**
- Monthly: Standard price (early adopter locked)
- Yearly: 10% discount (month × 12 × 0.9)
- Legacy plans: "priority" (maps to pro), "founder" (maps to premium)
- Free trial: 3-day trial (no payment required initially)

### Features by Plan

**Basic ($15/mo)**
- 1GB RAM, 1vCPU, 25GB NVMe SSD storage
- 2 websites per server
- 1TB monthly bandwidth
- Node.js deployment + Git auto-deploy
- Single domain per site
- No database backup snapshots

**Pro ($35/mo)** — Best Value
- 2GB RAM, 2vCPU, 60GB NVMe SSD storage
- 5 websites per server
- 3TB monthly bandwidth
- Node.js deployment + Git auto-deploy
- Multi-domain support

**Premium ($65/mo)**
- 4GB RAM, 2vCPU, 80GB NVMe SSD storage
- 10 websites per server
- 4TB monthly bandwidth
- Node.js deployment + Git auto-deploy
- Multi-domain support
- Daily automated backups (snapshots)
- Enhanced uptime SLA

### Billing Intervals

- **Monthly:** Card charged every 30 days
- **Yearly:** Charged annually (10% discount), auto-renewal

### Payment Processing

- **Gateway:** Stripe
- **Payment methods:** Credit/debit card (Visa, Mastercard, Amex, etc.)
- **Session creation:** After payment → redirect to /payment-success → /onboarding/choose
- **Subscription:** Saved to `payments` table + Stripe subscription ID stored on server
- **Cancellation:** Customer can delete server → cancels Stripe subscription automatically

---

## 10. All Deployment Types

### 1. **Node.js Web Application Deployment**

**Trigger:** 
- POST /deploy (Git URL provided)
- POST /onboarding/provision-nodejs (post-payment)
- GitHub webhook push (auto-deploy)

**Flow:**
1. Clone Git repository via SSH (GitHub/GitLab supported)
2. Detect package manager (npm, yarn, pnpm)
3. Install dependencies: `npm install` / `yarn install` / `pnpm install`
4. Build: `npm run build` (if defined in package.json)
5. Start with PM2 process manager: `pm2 start app.js --name "app"`
6. Configure Nginx reverse proxy (localhost:3000 → subdomain:443)
7. Provision SSL certificate (Certbot/Let's Encrypt)
8. Return deployment link: `https://subdomain.cloudedbasement.ca`

**Supported:**
- Express.js, Next.js, React, Vue, Svelte, etc.
- Port auto-detection (3000, 5000, 8080, etc.)
- Environment variables (from /api/env-vars)
- Database access (PostgreSQL/MongoDB if installed)

**Limits:**
- 2-10 sites per server (based on plan)
- 5 deployments per hour (rate-limited)
- 50KB output max per deployment log

**Status Polling:** GET /api/deployment-status/:id

### 2. **WordPress Site Deployment**

**Trigger:**
- POST /wordpress/create (post-payment or from dashboard)
- Special flow after Node.js server already running

**Flow:**
1. OS: Ubuntu 22.04 with MySQL, PHP-FPM, Nginx
2. WordPress core downloaded and configured
3. Database created + user setup
4. Random admin password generated (encrypted in DB)
5. wp-config.php auto-generated
6. SSL provisioned for domain
7. Admin URL accessible: `https://domain.com/wp-admin`

**Database:**
- MySQL database per WordPress site
- Encrypted credentials stored in `wordpress_sites` table
- Users can reveal credentials anytime

**Limitations:**
- 1 WordPress server per user (for now)
- Must include admin email + site title

**Status Polling:** GET /wordpress/status/:siteId
**Credentials:** GET /wordpress/credentials/:siteId (decrypts and returns)

### 3. **Preview Deployments**

**Trigger:**
- GitHub webhook push to non-main branch
- Auto-generated preview subdomain

**Features:**
- Deploy branch code without affecting production
- Separate preview URL: `https://preview-branch-name.cloudedbasement.ca`
- Same environment as production
- Auto-cleaned up after 14 days (default)
- Marked as `is_preview = true` in database

**Use case:** Feature branches, PR testing

### 4. **Static Site Deployment**

**Supported:**
- HTML/CSS/JavaScript
- Build outputs (Next.js with `next export`, Hugo, etc.)
- React build/ folder

**Flow:**
1. Clone repo
2. Detect static build (check for build/, dist/, public/, etc.)
3. Copy files to Nginx webroot: `/var/www/subdomain`
4. Nginx serves HTML with caching headers
5. Automatic 404 fallback (for SPAs)

---

## 11. All Email Features

### Transactional Emails Sent

#### User Registration & Account
1. **Confirmation Email** (after registration)
   - 6-digit verification code
   - 24-hour expiry
   - Resendable via `POST /resend-code`

2. **Welcome Email** (after email confirmed)
   - Congratulations message
   - Getting started guide link
   - Chat/support button

3. **Password Reset Email** (forgot password)
   - Reset link token (1-hour expiry)
   - Password change instructions
   - Security warning if not requested

#### Payment & Provisioning
4. **Payment Confirmation Email** (after successful Stripe charge)
   - Amount, plan, interval receipt
   - Subscription start date
   - Link to dashboard
   - Support contact info

5. **Trial Ending Warning** (24-hour notice before 3-day trial expires)
   - Countdown timer
   - Upgrade CTA
   - Plan comparison link

#### Server Operations
6. **Server Ready Email** (after provisioning completes)
   - Server IP address
   - SSH credentials (username/password)
   - Getting started link
   - Dashboard access link

7. **Deployment Error Email** (on deployment failure)
   - Error output truncated
   - AI-powered diagnosis (if available via Claude)
   - Suggested fixes
   - Support ticket creation link

8. **SSL Certificate Provisioned** (after auto-SSL setup)
   - Domain: [domain.com]
   - Expiry date
   - Auto-renewal confirmation

#### Monitoring & Alerts
9. **Uptime Alert - Down Email** (site goes offline)
   - URL: [domain.com]
   - Status code / error message
   - Response time (ms)
   - Retry check scheduled

10. **Uptime Alert - Recovery Email** (site comes back up)
    - URL: [domain.com]
    - Downtime duration
    - Current status

#### Admin Notifications
11. **Trial Expired - Server Powered Off** (sent to admin)
    - User ID and email
    - Droplet ID and IP
    - Time powered off
    - Destruction in 7 days notice

12. **Customer Subscription Cancelled** (sent to admin)
    - User email
    - Droplet ID and IP
    - Plan details
    - Stripe subscription ID

13. **Update Deployment Failed** (sent to admin)
    - Update ID and script
    - Related servers affected
    - Error output

### Email Configuration

- **From Address:** Configurable via FROM_EMAIL or per-provider settings
- **CAN-SPAM Compliance:** Address footer (Toronto, ON Canada), unsubscribe capable
- **Localization:** English only (for now)
- **Rate Limiting:** No limit on transactional emails

### Email Providers (Fallback Chain)

1. **SendGrid** (if SENDGRID_API_KEY set)
2. **Gmail OAuth2** (if credentials set)
3. **Mailtrap** (dev/test)
4. **Generic SMTP** (fallback)
5. **None** (logs warning, emails fail silently)

---

## 12. All Security Features

### Authentication & Authorization

#### Session Management
- **Tool:** express-session + connect-pg-simple (database-backed)
- **Duration:** 7 days with sliding window (resets on each request)
- **Cookie:** `sessionId` (renamed from default `connect.sid` for obscurity)
- **Secure:** httpOnly + SameSite=lax (allows Stripe/OAuth redirects)
- **HTTPS:** secure flag in production only
- **Regeneration:** Session ID regenerated on login (prevent fixation)

#### Two-Factor Authentication (TOTP)
- **Algorithm:** TOTP (Time-based One-Time Password), RFC 6238
- **Lib:** speakeasy v2
- **Setup:** Generate secret, display QR code (Authenticator app)
- **Verification:** Verify 6-digit code with 1-code window tolerance
- **Rate limit:** 10 attempts per 15 minutes
- **Storage:** Secret encrypted at rest in database
- **Per-session:** 2FA challenge stored in `req.session.pending2FAUserId`

#### Email Verification
- **Flow:** Registration → send confirmation code → verify code → activate account
- **Code:** 6-digit random alphanumeric (exclude confusing chars: O, 0, I, 1)
- **Expiry:** 24 hours
- **Verification:** Code match + expiry check
- **Resend:** Limited to 5 per hour (rate limited)
- **Token:** Stored as email_token + token_expires_at in users table

#### Password Requirements
- **Minimum:** 8 characters
- **Strength check:** zxcvbn library (entropy estimation, dictionary check)
- **Hashing:** bcrypt with salt rounds = 10
- **Reset:** Token-based (1-hour expiry), HMAC random bytes
- **Change:** Requires old password verification

#### Bot Protection
- **Registration:** 6-character code challenge (random uppercase alphanumeric)
- **Rate limit:** 5 registration attempts per hour per IP
- **Verification:** JavaScript fetch, compare code with session

### Authorization & Access Control

#### Admin-Only Routes
- **Middleware:** requireAdmin (always checks DB, never cached)
- **Routes:**
  - /admin/* - All admin pages
  - /admin/updates/* - Server update management
  - /admin/domains/* - Domain management
- **Query:** SELECT role FROM users WHERE id = ? (always fresh, prevent cache poisoning)

#### User Data Isolation
- **Ownership checks:** All endpoints verify user_id matches session.userId
- **No cross-user access:** GET /api/dashboard returns only requesting user's data
- **Server scoping:** POST /server-action verified against user_id

### CSRF Protection

#### Implementation
- **Pattern:** Double Submit Cookie (csrf-csrf v4)
- **Token:** 32-byte random value
- **Cookie name:** `__Host-csrf` (production), `csrf-secret` (dev)
- **Attributes:** httpOnly=true, sameSite=lax, secure=true (prod)
- **Verification:**
  - Accept from: X-CSRF-Token, CSRF-Token, X-XSRF-Token, body._csrf
  - Return 403 if mismatch or missing
- **Generation:** req.csrfToken() (shim for backward compatibility)

### Rate Limiting

#### Endpoint-Specific Limits
- **General:** 300 non-GET requests per 15 minutes (global)
- **Login:** 8 attempts per 15 minutes per IP
- **Registration:** 5 attempts per hour per IP
- **Email verification:** 5 attempts per hour
- **2FA:** 10 attempts per 15 minutes per IP
- **Deployment:** 5 per hour per user (by user ID, not IP)
- **Contact form:** 5 submissions per hour per IP
- **Payments:** 10 attempts per 15 minutes

#### Implementation
- **Lib:** express-rate-limit
- **Skip GET:** GET requests excluded (allow normal browsing)
- **Key generator:** Custom (deploy limiter uses user ID)

### Data Encryption

#### Passwords
- **Algorithm:** bcrypt with 10 salt rounds
- **Never logged:** Stripped before logs
- **Reset:** Token-based, 1-hour expiry

#### SSH Passwords (Encrypted)
- **Algorithm:** AES-256-CBC (Node.js crypto)
- **Storage:** BYTEA column (binary) + IV column
- **Decryption:** On-demand when fetching credentials
- **Never exposed:** API returns masked (null) unless explicitly requested

#### Database Credentials (Encrypted)
- **PostgreSQL password:** Same as SSH password encryption
- **MongoDB password:** Same as SSH password encryption
- **Encryption IV:** Unique for each credential

#### Environment Variables (Encrypted)
- **Algorithm:** AES-256-CBC
- **Storage:** BYTEA + IV columns
- **Access:** GET /api/env-vars (requires auth + CSRF)
- **Update:** POST /api/env-vars (auth + CSRF + validation)

#### WordPress Admin Password (Encrypted)
- **Algorithm:** AES-256-CBC
- **Storage:** wordpress_sites table (bytea + IV)
- **Access:** GET /wordpress/credentials/:siteId (rate-limited, decrypt on-demand)

### Dependency Security

#### Review & Updates
- **packages:** 65+ npm packages (via pnpm)
- **Audits:** Regular npm audit for vulnerabilities
- **Pinned versions:** package.json specifies exact versions (no ^/~/*)
- **Backend:** No eval, no arbitrary script execution (validated bash scripts only)

### Input Validation

#### Validators Used
- **express-validator:** Email, URL, length checks
- **DNS RFC compliance:** Domain validation (max 253 chars, labels max 63 chars, valid chars only)
- **Git URL whitelist:** GitHub, GitLab, Bitbucket, Codeberg, SourceHut only
- **SSRF prevention:** Block private IP addresses in Git URLs
- **XSS:** HTML escaping on all user input output
- **SQL injection:** Parameterized queries ($1, $2, ...) in all DB queries

### Content Security Policy (CSP)

#### Headers (via Helmet)
```
default-src 'self'
script-src 'self' <nonce> https://cdn.jsdelivr.net https://js.stripe.com https://unpkg.com https://www.googletagmanager.com
style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
img-src 'self' data: https:
frame-src https://js.stripe.com https://hooks.stripe.com
connect-src 'self' https://api.stripe.com https://m.stripe.com https://r.stripe.com https://q.stripe.com https://www.google-analytics.com
base-uri 'self'
form-action 'self'
script-src-attr 'none'
```

#### Nonce
- **Generation:** Per-request CSP nonce (random)
- **Injection:** Applied to inline scripts
- **Middleware:** nonceMiddleware (from src/utils/nonce.js)

### Security Headers (via Helmet)

- **Strict-Transport-Security:** Force HTTPS (prod only)
- **X-Content-Type-Options:** nosniff (prevent MIME sniffing)
- **X-Frame-Options:** DENY (clickjacking prevention)
- **X-XSS-Protection:** 1; mode=block (legacy XSS filter)
- **Referrer-Policy:** strict-origin-when-cross-origin
- **Permissions-Policy:** Restrict API access (geolocation, camera, mic, etc.)

### Reverse Proxy Security (Nginx)

#### Trust Proxy Headers
- **Middleware:** app.set('trust proxy', 1)
- **Headers:** X-Forwarded-For, X-Forwarded-Proto
- **HTTPS redirect:** Checks X-Forwarded-Proto !== 'https', redirects to HTTPS
- **Rate limiter:** Uses req.ip from headers (accurate with trusted proxy)

### Webhook Security

#### GitHub Webhooks
- **Signature verification:** HMAC SHA256 (X-Hub-Signature-256)
- **Timing-safe comparison:** crypto.timingSafeEqual()
- **Event filtering:** Only process 'push' events
- **Raw body preservation:** Middleware captures raw body before parsing

#### Stripe Webhooks
- **Placement:** Before express.json() to preserve raw body
- **Signature verification:** Stripe SDK built-in verification
- **Endpoint secret:** process.env.STRIPE_ENDPOINT_SECRET

### Admin Audit Trail

#### Tracked Actions
- Delete user
- Cancel provisioning
- Delete server
- Destroy droplet
- Server update operations

#### Storage
- `admin_audit_log` table with action, target, details (JSONB)
- Stored by: admin_id, target_user_id, target_server_id
- Queryable: Timeline of admin actions per user/server

### Security Event Logging

#### Events Tracked
- Login (successful + failed)
- Logout
- 2FA enabled/disabled
- Password reset
- API key operations (if implemented)
- Email verification
- Permission changes

#### Storage
- `security_events` table: event_type, user_id, IP, user_agent, details (JSONB)
- Retained: 90+ days (configurable)

### Third-Party Integration Security

#### Stripe
- **Key management:** SECRET_KEY in env, never exposed
- **Webhook verification:** Endpoint secret in env
- **PCI compliance:** No card data handled (Stripe Elements only)

#### DigitalOcean
- **API token:** DIGITALOCEAN_TOKEN in env (read from env only)
- **Scoped:** Can be limited to specific droplets/actions
- **HTTPS:** All DO API calls via HTTPS

#### GitHub OAuth
- **Client secret:** In env, never logged
- **Callback URL:** Registered on GitHub app settings
- **Scope:** profile, email only (minimal)

---

## 13. All Admin Features

### Admin Dashboard (GET /admin)

**Stats & Overview**
- Total users (count)
- Total servers (count + breakdown by status)
- Total domains (count)
- Recent deployments (last 50)
- Recent payments (last 50)
- Pending support requests

**Quick Actions**
- Delete user
- Cancel provisioning
- Delete server
- Destroy DigitalOcean droplet

**Data Tables**
- Users: id, email, role, email_confirmed, created_at (sortable)
- Servers: id, plan, status, IP, owner email, created_at
- Domains: id, domain, SSL status, renewal date, created_at
- Deployments: id, git URL, status, deployed date, owner email
- Payments: id, amount, plan, status, created date, customer email

### Server Updates Management (GET /admin/updates)

**Update Creation**
- Title, description, script content
- Type: config|security|feature|script
- Is critical: checkbox
- Auto-apply: checkbox (auto-deploy on creation)
- Script validation: Check for dangerous commands (rm -rf, dd, etc.)
- Script immutability: SHA256 hash stored, prevented modification

**Workflow Status**
- Draft → Created, not validated
- Tested → Successfully tested on ≥1 server
- Released → Available for customers to apply or push to all
- Archived → No longer active

**Details View (GET /admin/updates/:id)**
- Script content (read-only)
- Test results: Server ID, status, output
- Deployment log: Servers updated, success/failure count
- Retry button (if failures)
- Archive/delete buttons

**Mass Deployment**
- **Test:** POST /admin/updates/:id/test
  - Select test server
  - Execute script on it
  - Review output
  - Transition to 'tested'

- **Release:** POST /admin/updates/:id/release
  - Change status to 'released'
  - Make available for customer apply or mass push

- **Push:** POST /admin/updates/:id/push
  - Execute on all eligible servers (status = running, IP set, ssh_password set)
  - Rate-limited: 5 concurrent executions
  - Email failures to admin
  - Log all executions

- **Retry:** POST /admin/updates/:id/retry
  - Re-execute on servers where update previously failed
  - Log new attempts

- **Global Kill Switch:** POST /admin/updates/kill-switch
  - Toggle global pause for all updates
  - Prevents accidental mass deployment disasters
  - Kill-switch status displayed on dashboard

**Execution Details**
- SSH connection timeout: 30 seconds
- Script execution timeout: 5 minutes max
- Output limit: 50KB (truncate if exceeded)
- Execution logged: server_id, update_id, status, output, applied_at, applied_by

### User Management

**Delete User** - POST /admin/delete-user/:id
- Remove user account
- Delete associated: servers, deployments, domains, payments, environment variables
- Audit log recorded

**Cancel Provisioning** - POST /admin/cancel-provisioning/:id
- Abort pending server provisioning
- Mark server as 'failed'
- Notify user

**Delete Server** - POST /admin/delete-server/:id
- Soft-delete server (keep for audit)
- Update status to 'deleted'
- User can no longer access

**Destroy Droplet** - POST /admin/destroy-droplet/:id
- Hard-delete DigitalOcean droplet immediately
- Irreversible
- Audit log recorded

### Domain Management (Admin)

**List Domains** - GET /admin/domains/list
- Show all domains globally
- Domain, user, status, SSL expiry

**Add Domain** - POST /admin/domains
- Override domain restrictions
- Manually create domain record

**Update Domain** - PUT /admin/domains/:id
- Change status, renewal date, provider notes

**Delete Domain** - DELETE /admin/domains/:id
- Remove domain + delete DNS record

### Audit Logging

**Tracked in admin_audit_log**
- action: delete_user, cancel_provisioning, delete_server, destroy_droplet
- admin_id: who performed action
- target_user_id: affected user (if applicable)
- target_server_id: affected server (if applicable)
- details: JSONB with action-specific info
- created_at: timestamp

**Query:** All admin actions queryable by user, server, action type, date range

### System Settings

**Kill Switch** (updates_kill_switch)
- Pause all automatic server updates
- Status displayed on update dashboard
- Toggleable via API

**Rate Limit** (updates_rate_limit)
- Max concurrent update executions (default 5)
- Configurable per deployment run

---

## 14. All Specialized Features

### 1. **WordPress Integration**

**WordPress Site Creation**
- **Endpoint:** POST /wordpress/create
- **Input:** plan, siteTitle, adminEmail
- **Flow:**
  1. Check 1 active server per user limit
  2. Create DigitalOcean droplet with WordPress setup script
  3. Generate random admin password
  4. Store credentials encrypted (AES-256-CBC)
  5. Return HTTP 202 with site ID for polling
- **Status polling:** GET /wordpress/status/:siteId
- **Credentials:** GET /wordpress/credentials/:siteId (decrypt on-demand)

**Database:**
- `wordpress_sites` table: id, server_id, user_id, site_title, admin_email, admin_username, admin_password (encrypted), status, wordpress_url, db_name/user/password (encrypted), provisioning_output, created_at

**Features:**
- Automatic MySQL installation
- WordPress core download + auto-config
- PHP-FPM + Nginx
- SSL certificate (auto-provisioned)
- Admin access via WP Dashboard

### 2. **GitHub Auto-Deploy**

**Server-Wide Auto-Deploy**
- **Setup:** POST /enable-auto-deploy
- **Webhook URL:** `https://cloudedbasement.ca/webhook/github/:serverId`
- **Secret:** Random HMAC token stored on server
- **Trigger:** GitHub push event
- **Verification:** HMAC SHA256 signature check
- **Branch logic:**
  - Main/master → deploy to production
  - Other branches → auto-preview deploy

**Per-Domain Auto-Deploy**
- **Setup:** POST /enable-domain-autodeploy
- **Webhook URL:** `https://cloudedbasement.ca/webhook/github/:serverId/:domainId`
- **Secret:** Per-domain webhook secret
- **Trigger:** GitHub push event
- **Branch:** Default branch deploys to domain's git_url
- **Multiple webhooks:** Each domain can have separate GitHub webhook

**Webhook Endpoint:** POST /webhook/github/:serverId (± :domainId)
- Verify signature (HMAC SHA256)
- Extract repo URL, branch, commit count
- Trigger deployment async
- Return 200 immediately (don't block on deploy)

### 3. **Preview Deployments**

**Automatic Non-Main Branch Deploys**
- **Trigger:** GitHub webhook to non-main branch (auto-deploy enabled)
- **Subdomain:** `preview-{branch-sanitized}` on cloudedbasement.ca
- **Separate URL:** Each branch gets unique preview URL
- **Lifecycle:** Auto-cleanup after 14 days (configurable)
- **Database flag:** is_preview = true

**Use Case:** Feature branch testing before production merge

### 4. **Auto-SSL Provisioning**

**Automated Certificate Provisioning**
- **Trigger:** Domain added + DNS verified
- **Service:** services/autoSSL.js (runs every 5 minutes)
- **Process:**
  1. Query domains without SSL, with running server
  2. Check DNS resolution (A record → server IP)
  3. SSH into server, run certbot
  4. Install certificate to Nginx
  5. Update database: ssl_enabled, ssl_expires_at
- **Certificate:** Let's Encrypt (90-day validity)
- **Auto-renewal:** Certbot renews automatically 30 days before expiry
- **Alert:** Email user 30/7/1 day before expiry

**SSL Verification Service** (runs every 30 minutes)
- Reconcile actual cert status on server vs. database
- Update expiry dates if mismatched
- Detect orphaned SSL records

### 5. **Trial & Subscription Management**

**Free Trial (3 Days)**
- **Availability:** First-time users get 1 trial
- **Trigger:** POST /start-trial (after register, no payment)
- **Server specs:** Based on trial tier (default: Basic)
- **Expiry:** 3 days from creation
- **Converted to paid:** If user pays within trial period (upgrade subscription)
- **Expiry action:** power_off if no payment, then destroy after 7 days stopped

**Subscription Monitoring** (runs every 6 hours)
- **Trial expired check:**
  - Query: servers created >3 days ago, unpaid, running
  - Action: power off droplet
  - Email: admin notification
- **Failed payment check:**
  - Query: servers with failed Stripe subscription
  - Action: power off droplet
  - Email: user notification (retry payment)
- **Cleanup check:**
  - Query: servers powered off >7 days
  - Action: destroy DigitalOcean droplet
  - Email: admin notification
  - Database: soft-delete server (status='deleted')

### 6. **Uptime Monitoring**

**Uptime Status Checking** (runs every 5 minutes)
- **Targets:** All deployed subdomains + verified custom domains (success + running server)
- **HTTP(S) ping:**
  - Target: HTTPS URL
  - Timeout: 8 seconds
  - Response: status code, response time (ms)
  - Concurrency: Max 10 concurrent requests
- **Status tracking:**
  - Record in uptime_status table: is_up, response_ms, status_code, error_message, checked_at
- **Alert deduplication:**
  - Track last known status per check
  - Only email on transitions (up→down or down→up)
  - Never spam repeated down alerts

**Alert Emails**
- **Down:** URL, error message, response time, retry scheduled
- **Recovery:** URL, downtime duration, current status

### 7. **Environment Variables Management**

**User-Defined Environment Variables**
- **API:** GET/POST/DELETE /api/env-vars
- **Storage:**
  - `environment_variables` table: name, value (encrypted), is_encrypted, server_id, user_id
  - Encryption: AES-256-CBC + IV
- **Usage:** Deployed apps access via `process.env.VAR_NAME`
- **Persistence:** Variables restart with app (stored in .env or Nginx)
- **Sensitive:** Never logged or exposed (masked in API responses per default)

### 8. **Database Provisioning**

**PostgreSQL Installation**
- **Trigger:** POST /setup-database
- **Installation:** SSH, run apt-get install postgresql postgresql-contrib
- **Database creation:** CREATE DATABASE `app_db`
- **User creation:** CREATE USER `basement_user` WITH PASSWORD `rand`
- **Credentials stored:** DB name, user, password (encrypted in servers table)
- **Access:** Credentials available via GET /api/credentials

**MongoDB Installation** (optional alternative)
- **Trigger:** POST /setup-database (select MongoDB)
- **Installation:** SSH, run MongoDB apt repo + install
- **Credentials stored:** mongodb_db_name, mongodb_db_password (encrypted)

### 9. **Deployment Logging & Error Diagnosis**

**Deployment Output Capture**
- **Log stored:** deployments.output (TEXT, up to 50KB)
- **Real-time:** Appended as deployment progresses
- **Status tracking:** deployments.status (pending → building → deploying → success|failed)

**Failure Diagnosis**
- **AI-powered analysis:** services/aiDiagnosis.js
- **Claude API:** Send error output, get explanation + suggestions
- **Email:** Include diagnosis in deployment failure email
- **Manual review:** Admin can read full output for failed deployments

### 10. **Server Update Orchestration**

**Workflow:**
1. Draft: Admin creates update, validates script
2. Test: Execute on 1 server, review output
3. Released: Available for mass deployment
4. Pushed: Execute on all customer servers (rate-limited)
5. Archived/Deleted: Retired or dev-only

**Safety Features:**
- Script immutability (hash verification)
- Kill switch (pause all updates)
- Rate limiting (5 concurrent)
- Full audit trail (execution logged)
- Rollback mechanism (revert on failure)

### 11. **Multi-Site Deployment**

**Multiple Deployments per Server**
- **Limit:** 2-10 sites per server (based on plan)
- **Subdomains:** Each site gets unique subdomain.cloudedbasement.ca
- **Nginx:** Reverse proxy to different ports (3000, 3001, 3002, etc. per site)
- **Database:** Deployments table linked to server_id
- **Management:** Each site managed separately (deploy/rollback/delete)

### 12. **Custom Domain Support**

**Add Custom Domain**
- **Flow:** Domain provider → point A record to server IP → DNS verification
- **Verification:** Auto-SSL checks DNS resolution points to correct IP
- **SSL:** Auto-provisioned once DNS verified
- **Linking:** Domain can be linked to specific deployment or server-wide

**Per-Domain Webhook**
- **Feature:** Each domain can have separate GitHub auto-deploy webhook
- **Benefit:** Different repos can deploy to different domains on same server

### 13. **SSH Access & Terminal**

**SSH Credentials**
- **Username:** root (default)
- **Password:** Randomly generated (16 bytes + special chars)
- **Encryption:** AES-256-CBC, stored in servers.ssh_password
- **Access:** GET /api/credentials (decrypt on-demand)
- **Copy to clipboard:** React dashboard provides copy button

**SSH Port:** 22 (default)
**Firewall:** UFW allows SSH + HTTP + HTTPS

### 14. **Deployment Rollback**

**Rollback Feature**
- **Trigger:** POST /rollback
- **Action:** Revert to previous successful deployment
- **Mechanism:**
  - Query: Previous deployment record with status='success'
  - Restart: SSH into server, switch app folder symlink or restart PM2 on old git commit
- **Status:** New deployment record created with status='rolling_back'

### 15. **Auto-Scaling (Limited)**
Currently not fully implemented but infrastructure supports:
- Droplet plan upgrade (manual)
- Horizontal scaling (multiple servers per user via plan upgrade)

---

## Summary Statistics

- **Total API Routes:** 60+
- **Total Database Tables:** 15+
- **Total Services:** 15
- **Total Controllers:** 12
- **Total Middleware:** 5
- **Background Jobs:** 7
- **External Integrations:** 8
- **Email Types:** 13
- **Security Features:** 12+ major categories
- **Admin Capabilities:** 5 feature areas

---

## Key Dependencies

**Core Framework**
- express ^5.2.1
- pg ^8.17.1 (PostgreSQL driver)
- express-session ^1.18.2 + connect-pg-simple ^10.0.0

**Authentication**
- passport ^0.7.0, passport-google-oauth20 ^2.0.0
- bcrypt ^6.0.0
- speakeasy ^2.0.0 (TOTP)
- qrcode ^1.5.4 (QR code generation)

**Security**
- helmet ^8.1.0 (CSP headers)
- express-rate-limit ^8.2.1
- csrf-csrf ^4.0.3
- express-validator ^7.3.1

**External APIs**
- stripe ^20.1.2
- axios ^1.13.2
- @anthropic-ai/sdk ^0.80.0 (Claude for error diagnosis)
- ssh2 ^1.17.0

**Email**
- nodemailer ^7.0.12
- @sendgrid/mail ^8.1.6
- @azure/communication-email ^1.1.0

**Monitoring**
- @sentry/node ^10.36.0
- @sentry/profiling-node ^10.36.0

**Development**
- nodemon ^3.1.11
- tailwindcss ^4.1.18

---

**Audit completed: April 2026**
**Last updated:** Current date
