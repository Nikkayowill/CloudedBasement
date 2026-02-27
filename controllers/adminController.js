const pool = require('../db');
const { getHTMLHead, getFooter, getScripts, getResponsiveNav, escapeHtml } = require('../src/utils/helpers');

// GET /admin - Simple scrollable admin dashboard
const listUsers = async (req, res) => {
  try {
    // Optimized: Single query with parallel fetching instead of 6 sequential queries
    const [usersResult, serversResult, domainsResult, deploymentsResult, paymentsResult, pendingRequestsResult] = await Promise.all([
      pool.query('SELECT id, email, role, email_confirmed, created_at FROM users ORDER BY created_at DESC'),
      pool.query('SELECT s.id, s.plan, s.status, s.ip_address, s.ipv6_address, s.created_at, u.email as owner_email FROM servers s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.created_at DESC'),
      pool.query('SELECT id, domain, ssl_enabled, ssl_expires_at, created_at FROM domains ORDER BY created_at DESC'),
      pool.query('SELECT d.id, d.git_url, d.status, d.deployed_at, u.email as owner_email FROM deployments d LEFT JOIN users u ON d.user_id = u.id ORDER BY d.deployed_at DESC LIMIT 50'),
      pool.query('SELECT p.id, p.amount, p.plan, p.status, p.created_at, u.email as customer_email FROM payments p LEFT JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 50'),
      pool.query('SELECT t.id, t.description, t.status, t.created_at, u.email as customer_email FROM support_tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.subject = $1 AND t.status IN ($2, $3) ORDER BY t.created_at ASC', ['Server Setup Request', 'open', 'in-progress'])
    ]);
    
    const users = usersResult.rows;
    const servers = serversResult.rows;
    const domains = domainsResult.rows;
    const deployments = deploymentsResult.rows;
    const payments = paymentsResult.rows;
    const pendingRequests = pendingRequestsResult.rows;

    res.send(`
${getHTMLHead('Admin Dashboard')}
    ${getResponsiveNav(req)}

    <div class="dashboard-grid">
    <!-- Admin Sidebar -->
    <aside class="dashboard-sidebar hidden md:block">
        <!-- Admin Badge -->
        <div class="sidebar-user">
            <div class="sidebar-user-avatar bg-gradient-to-br from-red-500 to-orange-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            </div>
            <div class="sidebar-user-info">
                <div class="sidebar-user-name">Admin Panel</div>
                <div class="sidebar-user-plan text-red-400">Full Access</div>
            </div>
        </div>
        
        <!-- Overview Section -->
        <nav class="sidebar-section">
            <h3 class="sidebar-section-title">Overview</h3>
            <ul class="sidebar-nav-list">
                <li>
                    <a href="#stats" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                        Stats
                    </a>
                </li>
                ${pendingRequests.length > 0 ? `
                <li>
                    <a href="#pending" class="sidebar-nav-link text-orange-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Pending (${pendingRequests.length})
                    </a>
                </li>
                ` : ''}
            </ul>
        </nav>
        
        <!-- Data Section -->
        <nav class="sidebar-section">
            <h3 class="sidebar-section-title">Data</h3>
            <ul class="sidebar-nav-list">
                <li>
                    <a href="#users" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/></svg>
                        Users (${users.length})
                    </a>
                </li>
                <li>
                    <a href="#servers" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"/></svg>
                        Servers (${servers.length})
                    </a>
                </li>
                <li>
                    <a href="#domains" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>
                        Domains (${domains.length})
                    </a>
                </li>
            </ul>
        </nav>
        
        <!-- Activity Section -->
        <nav class="sidebar-section">
            <h3 class="sidebar-section-title">Activity</h3>
            <ul class="sidebar-nav-list">
                <li>
                    <a href="#deployments" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Deployments
                    </a>
                </li>
                <li>
                    <a href="#payments" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                        Payments
                    </a>
                </li>
            </ul>
        </nav>
        
        <!-- Quick Links -->
        <nav class="sidebar-section">
            <h3 class="sidebar-section-title">Quick Links</h3>
            <ul class="sidebar-nav-list">
                <li>
                    <a href="/admin/updates" class="sidebar-nav-link text-orange-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Server Updates
                    </a>
                </li>
                <li>
                    <a href="https://cloud.digitalocean.com/droplets" target="_blank" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        DigitalOcean
                    </a>
                </li>
                <li>
                    <a href="https://dashboard.stripe.com" target="_blank" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        Stripe
                    </a>
                </li>
                <li>
                    <a href="/dashboard" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
                        User Dashboard
                    </a>
                </li>
            </ul>
        </nav>
    </aside>

    <!-- Mobile Sidebar Overlay -->
    <div id="sidebar-overlay" class="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 hidden"></div>

    <!-- Main Content Area -->
    <main class="dashboard-content">
        <!-- Admin Header -->
        <header class="flex flex-col gap-4 mb-8">
            <div class="flex items-center gap-4">
                <!-- Mobile sidebar toggle -->
                <button id="mobile-sidebar-toggle" class="md:hidden p-2 rounded-lg transition-colors" style="color:var(--dash-text-secondary)">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                <div class="flex-1">
                    <h1 class="text-xl md:text-2xl font-bold" style="color:var(--dash-text-primary)">Admin Dashboard</h1>
                    <p class="text-xs" style="color:var(--dash-text-muted)">Manage users, servers, and payments</p>
                </div>
                <a href="/pay?demo=true&plan=pro" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm transition-colors flex items-center gap-2">
                    <span>▶</span> Demo Mode
                </a>
            </div>
        </header>

        <!-- Content Sections -->
        <div class="space-y-8">
        
            <!-- STATS SECTION -->
            <div id="stats" class="scroll-mt-24">
                <h4 class="admin-section-title">Stats</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="admin-card p-4">
                        <p class="text-xs uppercase font-bold mb-1" style="color:var(--dash-text-muted)">Users</p>
                        <p class="text-2xl font-bold text-brand">${users.length}</p>
                    </div>
                    <div class="admin-card p-4">
                        <p class="text-xs uppercase font-bold mb-1" style="color:var(--dash-text-muted)">Servers</p>
                        <p class="text-2xl font-bold text-green-400">${servers.filter(s => s.status === 'running').length}/${servers.length}</p>
                    </div>
                    <div class="admin-card p-4">
                        <p class="text-xs uppercase font-bold mb-1" style="color:var(--dash-text-muted)">Domains</p>
                        <p class="text-2xl font-bold text-purple-400">${domains.length}</p>
                    </div>
                    <div class="admin-card p-4">
                        <p class="text-xs uppercase font-bold mb-1" style="color:var(--dash-text-muted)">Revenue</p>
                        <p class="text-2xl font-bold text-yellow-400">$${(payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0) / 100).toFixed(0)}</p>
                    </div>
                </div>
            </div>

            ${pendingRequests.length > 0 ? `
            <!-- PENDING SECTION -->
            <div id="pending" class="admin-card p-6 scroll-mt-24" style="border-color:rgba(249,115,22,0.4)">
                <h4 class="admin-section-title" style="color:#fb923c">⚡ Pending Requests (${pendingRequests.length})</h4>
                <div class="overflow-x-auto">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Details</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pendingRequests.map(r => {
                              const details = r.description.split('\\n').reduce((acc, line) => {
                                const [key, val] = line.split(': ');
                                acc[key] = val;
                                return acc;
                              }, {});
                              return `
                              <tr>
                                <td style="color:var(--dash-text-primary);font-size:0.875rem">${escapeHtml(r.customer_email)}</td>
                                <td style="color:var(--dash-text-secondary);font-size:0.75rem">
                                    <span class="text-brand">${escapeHtml(details.Region || 'N/A')}</span> · ${escapeHtml(details['Server Name'] || 'Default')}
                                </td>
                                <td><span class="admin-badge admin-badge-orange">${escapeHtml(r.status)}</span></td>
                                <td style="color:var(--dash-text-muted);font-size:0.75rem">${new Date(r.created_at).toLocaleDateString()}</td>
                                <td>
                                    <a href="https://cloud.digitalocean.com/droplets/new" target="_blank" class="text-brand hover:text-cyan-400 text-xs font-bold">Provision →</a>
                                </td>
                              </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}

      <!-- USERS SECTION -->
      <div id="users" class="admin-card p-6 scroll-mt-24">
        <h4 class="admin-section-title">Users (${users.length})</h4>
        <div class="overflow-x-auto">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Confirmed</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td style="color:var(--dash-text-primary);font-size:0.875rem">${escapeHtml(u.email)}</td>
                  <td><span class="admin-badge ${u.role === 'admin' ? 'admin-badge-red' : 'admin-badge-gray'}">${u.role}</span></td>
                  <td style="font-size:0.75rem">${u.email_confirmed ? '<span style="color:#4ade80">✓</span>' : '<span style="color:#f87171">✗</span>'}</td>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem">${new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    <form method="POST" action="/admin/delete-user/${u.id}" class="inline" onsubmit="return confirm('Delete ${escapeHtml(u.email)}?');">
                      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                      <button type="submit" class="admin-btn admin-btn-red">Delete</button>
                    </form>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SERVERS SECTION -->
      <div id="servers" class="admin-card p-6 scroll-mt-24">
        <h4 class="admin-section-title">Servers (${servers.length})</h4>
        <div class="overflow-x-auto">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Status</th>
                <th>IP</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${servers.map(s => `
                <tr>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem;font-family:monospace">#${s.id}</td>
                  <td style="color:var(--dash-text-primary);font-size:0.875rem">${escapeHtml(s.owner_email || '-')}</td>
                  <td><span class="admin-badge admin-badge-blue">${escapeHtml(s.plan)}</span></td>
                  <td><span class="admin-badge ${s.status === 'running' ? 'admin-badge-green' : s.status === 'provisioning' ? 'admin-badge-yellow' : s.status === 'deleted' ? 'admin-badge-gray' : 'admin-badge-red'}">${escapeHtml(s.status)}</span></td>
                  <td style="font-size:0.75rem;font-family:monospace" class="text-brand">${escapeHtml(s.ip_address || '-')}</td>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem">${new Date(s.created_at).toLocaleDateString()}</td>
                  <td>
                    <div class="flex gap-1">
                      ${s.status === 'provisioning' ? `
                      <form method="POST" action="/admin/cancel-provisioning/${s.id}" class="inline" onsubmit="return confirm('Cancel provisioning?');">
                        <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                        <button type="submit" class="admin-btn admin-btn-orange">Cancel</button>
                      </form>
                      ` : ''}
                      ${s.status === 'deleted' ? `
                      <form method="POST" action="/admin/delete-server/${s.id}" class="inline" onsubmit="return confirm('Remove server record #${s.id}?');">
                        <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                        <button type="submit" class="admin-btn">Remove Record</button>
                      </form>
                      ` : `
                      <form method="POST" action="/admin/destroy-droplet/${s.id}" class="inline" onsubmit="return confirm('DESTROY droplet for server #${s.id}? This will delete the droplet from DigitalOcean and remove the server record. Cannot be undone!');">
                        <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                        <button type="submit" class="admin-btn admin-btn-red">Destroy</button>
                      </form>
                      `}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- DOMAINS SECTION -->
      <div id="domains" class="admin-card p-6 scroll-mt-24">
        <h4 class="admin-section-title">Domains (${domains.length})</h4>
        <div class="overflow-x-auto">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th>SSL</th>
                <th>Expires</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${domains.map(d => `
                <tr>
                  <td style="color:var(--dash-text-primary);font-size:0.875rem;font-family:monospace">${escapeHtml(d.domain)}</td>
                  <td style="font-size:0.75rem">${d.ssl_enabled ? '<span style="color:#4ade80">🔒 Active</span>' : '<span style="color:var(--dash-text-muted)">—</span>'}</td>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem">${d.ssl_expires_at ? new Date(d.ssl_expires_at).toLocaleDateString() : '-'}</td>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem">${new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- DEPLOYMENTS SECTION -->
      <div id="deployments" class="admin-card p-6 scroll-mt-24">
        <h4 class="admin-section-title">Deployments (${deployments.length})</h4>
        <div class="overflow-x-auto">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Owner</th>
                <th>Git URL</th>
                <th>Status</th>
                <th>Deployed</th>
              </tr>
            </thead>
            <tbody>
              ${deployments.map(d => `
                <tr>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem;font-family:monospace">#${d.id}</td>
                  <td style="color:var(--dash-text-primary);font-size:0.875rem">${escapeHtml(d.owner_email || '-')}</td>
                  <td style="color:var(--dash-text-secondary);font-size:0.75rem;font-family:monospace;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(d.git_url || '-')}</td>
                  <td><span class="admin-badge ${d.status === 'success' ? 'admin-badge-green' : d.status === 'failed' ? 'admin-badge-red' : 'admin-badge-yellow'}">${escapeHtml(d.status)}</span></td>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem">${d.deployed_at ? new Date(d.deployed_at).toLocaleDateString() : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAYMENTS SECTION -->
      <div id="payments" class="admin-card p-6 scroll-mt-24">
        <h4 class="admin-section-title">Payments (${payments.length})</h4>
        <div class="overflow-x-auto">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(p => `
                <tr>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem;font-family:monospace">#${p.id}</td>
                  <td style="color:var(--dash-text-primary);font-size:0.875rem">${escapeHtml(p.customer_email || '-')}</td>
                  <td><span class="admin-badge admin-badge-blue">${escapeHtml(p.plan)}</span></td>
                  <td style="font-size:0.875rem;font-weight:700" class="text-brand">$${(p.amount / 100).toFixed(2)}</td>
                  <td><span class="admin-badge ${p.status === 'succeeded' ? 'admin-badge-green' : 'admin-badge-red'}">${escapeHtml(p.status)}</span></td>
                  <td style="color:var(--dash-text-muted);font-size:0.75rem">${new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

        </div>
    </main>
    </div>

    ${getFooter()}
    ${getScripts('nav.js', 'dashboard.js')}
  `);
  } catch (error) {
    console.error('Admin error:', error);
    res.status(500).send('Failed to load admin page');
  }
};

// POST /admin/delete-user/:id - Delete a user account
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Delete user (cascade will handle related records if foreign keys are set up)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    
    res.redirect('/admin?success=User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    res.redirect('/admin?error=Failed to delete user');
  }
};

// POST /admin/cancel-provisioning/:id - Cancel provisioning and mark as failed
const cancelProvisioning = async (req, res) => {
  try {
    const serverId = req.params.id;
    
    // Update server status to failed
    await pool.query(
      'UPDATE servers SET status = $1 WHERE id = $2',
      ['failed', serverId]
    );
    
    console.log(`Admin cancelled provisioning for server ${serverId}`);
    res.redirect('/admin?success=Provisioning cancelled successfully');
  } catch (error) {
    console.error('Cancel provisioning error:', error);
    res.redirect('/admin?error=Failed to cancel provisioning');
  }
};

// POST /admin/delete-server/:id - Delete a server record
const deleteServer = async (req, res) => {
  try {
    const serverId = req.params.id;
    
    // Delete server record from database (does not destroy actual droplet)
    await pool.query('DELETE FROM servers WHERE id = $1', [serverId]);
    
    res.redirect('/admin?success=Server record deleted successfully');
  } catch (error) {
    console.error('Delete server error:', error);
    res.redirect('/admin?error=Failed to delete server');
  }
};

// POST /admin/destroy-droplet/:id - Destroy actual DigitalOcean droplet and delete server record
const destroyDroplet = async (req, res) => {
  try {
    const serverId = req.params.id;
    const { destroyDropletByServerId } = require('../services/digitalocean');
    
    const result = await destroyDropletByServerId(serverId);
    
    res.redirect('/admin?success=' + encodeURIComponent(result.message || 'Droplet destroyed and server deleted successfully'));
  } catch (error) {
    console.error('Destroy droplet error:', error);
    res.redirect('/admin?error=Failed to destroy droplet: ' + encodeURIComponent(error.message));
  }
};

module.exports = { listUsers, deleteUser, deleteServer, destroyDroplet, cancelProvisioning };
