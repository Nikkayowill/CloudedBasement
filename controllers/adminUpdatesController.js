/**
 * Admin Updates Controller - Secure Update Orchestration UI
 * 
 * Workflow: draft → test → release → push/archive
 * 
 * Routes:
 *   GET  /admin/updates              - Dashboard
 *   GET  /admin/updates/:id          - Update detail view
 *   POST /admin/updates/create       - Create new update (draft)
 *   POST /admin/updates/:id/test     - Test on single server
 *   POST /admin/updates/:id/release  - Release for customers/push
 *   POST /admin/updates/:id/push     - Push to all servers
 *   POST /admin/updates/:id/retry    - Retry failed servers
 *   POST /admin/updates/:id/archive  - Archive update
 *   POST /admin/updates/:id/delete   - Delete draft/archived
 *   POST /admin/updates/kill-switch  - Toggle kill switch
 */

const pool = require('../db');
const { getHTMLHead, getFooter, getScripts, getResponsiveNav, escapeHtml } = require('../src/utils/helpers');
const { getNonce } = require('../src/utils/nonce');
const serverUpdates = require('../services/serverUpdates');
const { UPDATE_STATUS } = serverUpdates;

// Status badge styling
const STATUS_BADGES = {
  draft:    { cls: 'admin-badge admin-badge-gray',   label: 'Draft'    },
  tested:   { cls: 'admin-badge admin-badge-yellow', label: 'Tested'   },
  released: { cls: 'admin-badge admin-badge-green',  label: 'Released' },
  archived: { cls: 'admin-badge admin-badge-gray',   label: 'Archived' },
};

const TYPE_STYLES = {
  security: { dot: 'bg-red-500', text: 'text-red-400' },
  config: { dot: 'bg-yellow-500', text: 'text-yellow-400' },
  feature: { dot: 'bg-blue-500', text: 'text-blue-400' },
  script: { dot: 'bg-purple-500', text: 'text-purple-400' },
};

// ============================================================
// GET /admin/updates - Main Dashboard
// ============================================================
const showUpdates = async (req, res) => {
  try {
    const updates = await serverUpdates.getAllUpdates();
    const killSwitchActive = await serverUpdates.isKillSwitchActive();
    const testServers = await serverUpdates.getEligibleTestServers();
    
    // Get total running servers
    const serversResult = await pool.query("SELECT COUNT(*) FROM servers WHERE status = 'running'");
    const totalServers = parseInt(serversResult.rows[0].count);

    res.send(`
${getHTMLHead('Server Updates - Admin')}
    ${getResponsiveNav(req)}

    <div class="dashboard-grid">
    <!-- Sidebar -->
    <aside class="dashboard-sidebar hidden md:block">
        <div class="sidebar-user">
            <div class="sidebar-user-avatar bg-gradient-to-br from-orange-500 to-red-600">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
            </div>
            <div class="sidebar-user-info">
                <div class="sidebar-user-name">Update System</div>
                <div class="sidebar-user-plan ${killSwitchActive ? 'text-red-400' : 'text-green-400'}">
                    ${killSwitchActive ? '⚠️ PAUSED' : `✓ Active · ${totalServers} servers`}
                </div>
            </div>
        </div>
        
        <nav class="sidebar-section">
            <h3 class="sidebar-section-title">Quick Actions</h3>
            <ul class="sidebar-nav-list">
                <li>
                    <a href="/admin" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"/></svg>
                        Back to Admin
                    </a>
                </li>
                <li>
                    <a href="#create" class="sidebar-nav-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                        Create Update
                    </a>
                </li>
            </ul>
        </nav>
        
        <nav class="sidebar-section">
            <h3 class="sidebar-section-title">Workflow</h3>
            <ul class="sidebar-nav-list text-xs">
                <li class="px-3 py-2 text-gray-500">
                    <span class="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
                    1. Draft → Create script
                </li>
                <li class="px-3 py-2 text-gray-500">
                    <span class="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                    2. Test → Verify on 1 server
                </li>
                <li class="px-3 py-2 text-gray-500">
                    <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    3. Release → Available to all
                </li>
                <li class="px-3 py-2 text-gray-500">
                    <span class="inline-block w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
                    4. Push → Mass deployment
                </li>
            </ul>
        </nav>
        
        <nav class="sidebar-section">
            <h3 class="sidebar-section-title">Safety</h3>
            <form method="POST" action="/admin/updates/kill-switch" class="px-3">
                <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                <button type="submit"
                    class="w-full admin-btn ${killSwitchActive ? 'admin-btn-green' : 'admin-btn-red'}"
                    style="justify-content:center;font-size:0.8125rem;font-weight:600;padding:0.5rem 0.75rem"
                    onclick="return confirm('${killSwitchActive ? 'Resume update execution?' : 'STOP all update executions?'}')">
                    ${killSwitchActive ? '▶ Resume Executions' : '⏹ Emergency Stop'}
                </button>
            </form>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-content">
        <header class="flex flex-col gap-4 mb-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl md:text-2xl font-bold" style="color:var(--dash-text-primary)">Server Updates</h1>
                    <p class="text-xs" style="color:var(--dash-text-muted)">Secure push of patches, configs, and scripts</p>
                </div>
                <a href="/admin" style="color:var(--dash-text-secondary)" class="text-sm hover:text-white">← Admin</a>
            </div>
            
            ${killSwitchActive ? `
            <div class="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                <strong>⚠️ KILL SWITCH ACTIVE</strong> - All update executions are paused. Use the sidebar to resume.
            </div>
            ` : ''}
        </header>

        ${req.query.success ? `
        <div class="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
            ${escapeHtml(req.query.success)}
        </div>
        ` : ''}
        
        ${req.query.error ? `
        <div class="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            ${escapeHtml(req.query.error)}
        </div>
        ` : ''}
        
        ${req.query.warning ? `
        <div class="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg mb-6">
            ${escapeHtml(req.query.warning)}
        </div>
        ` : ''}

        <div class="space-y-8">
            <!-- CREATE UPDATE FORM -->
            <div id="create" class="admin-card p-6 scroll-mt-24">
                <h4 class="admin-section-title">Create New Update</h4>
                <p class="text-xs mb-4" style="color:var(--dash-text-muted)">Script is validated for dangerous commands and immutably hashed.</p>

                <form method="POST" action="/admin/updates/create" class="space-y-4">
                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold mb-1" style="color:var(--dash-text-secondary)">Title *</label>
                            <input type="text" name="title" required placeholder="Security patch v1.0.2" class="admin-input">
                        </div>
                        <div>
                            <label class="block text-xs font-bold mb-1" style="color:var(--dash-text-secondary)">Version</label>
                            <input type="text" name="version" placeholder="1.0.2" class="admin-input">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold mb-1" style="color:var(--dash-text-secondary)">Type</label>
                            <select name="type" class="admin-input">
                                <option value="security">🔴 Security (Critical)</option>
                                <option value="config">🟡 Config</option>
                                <option value="feature">🔵 Feature</option>
                                <option value="script">🟣 Script</option>
                            </select>
                        </div>
                        <div class="flex items-end gap-4">
                            <label class="flex items-center gap-2 text-sm" style="color:var(--dash-text-secondary)">
                                <input type="checkbox" name="isCritical" class="rounded">
                                Mark as Critical
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-bold mb-1" style="color:var(--dash-text-secondary)">Description</label>
                        <input type="text" name="description" placeholder="Patches CVE-2026-1234 vulnerability" class="admin-input">
                    </div>

                    <div>
                        <label class="block text-xs font-bold mb-1" style="color:var(--dash-text-secondary)">Bash Script *</label>
                        <textarea name="script" required rows="8" placeholder="#!/bin/bash
# Description of what this script does
set -euo pipefail

apt update
apt upgrade -y" class="admin-input" style="font-family:monospace;font-size:0.8125rem"></textarea>
                        <p class="text-xs mt-1" style="color:var(--dash-text-muted)">
                            ⚠️ <code>set -euo pipefail</code> will be auto-added. Dangerous commands are blocked.
                        </p>
                    </div>

                    <div class="flex justify-end">
                        <button type="submit" class="admin-btn admin-btn-primary" style="padding:0.5rem 1.125rem;font-size:0.875rem">
                            Create Draft
                        </button>
                    </div>
                </form>
            </div>

            <!-- ALL UPDATES -->
            <div id="updates" class="admin-card p-6 scroll-mt-24">
                <h4 class="admin-section-title">All Updates (${updates.length})</h4>

                ${updates.length === 0 ? `
                <p class="text-sm" style="color:var(--dash-text-muted)">No updates created yet. Create one above to get started.</p>
                ` : `
                <div class="overflow-x-auto">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Update</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Servers</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${updates.map(u => {
                              const status = STATUS_BADGES[u.status] || STATUS_BADGES.draft;
                              const type = TYPE_STYLES[u.type] || TYPE_STYLES.config;
                              return `
                            <tr>
                                <td>
                                    <a href="/admin/updates/${u.id}" style="color:var(--dash-text-primary);font-weight:500" class="hover:text-blue-400">${escapeHtml(u.title)}</a>
                                    <div style="color:var(--dash-text-muted);font-size:0.75rem;margin-top:0.125rem">${escapeHtml(u.description || 'No description')}</div>
                                    ${u.version ? `<div style="color:var(--dash-text-muted);font-size:0.6875rem">v${escapeHtml(u.version)}</div>` : ''}
                                </td>
                                <td>
                                    <span class="inline-flex items-center gap-1.5 text-xs font-medium ${type.text}">
                                        <span class="w-2 h-2 rounded-full ${type.dot}"></span>
                                        ${u.type}
                                    </span>
                                    ${u.is_critical ? '<span class="ml-1 text-xs text-red-400">⚠️</span>' : ''}
                                </td>
                                <td>
                                    <span class="${status.cls}">${status.label}</span>
                                </td>
                                <td style="font-size:0.75rem">
                                    ${u.status === 'released' ? `
                                        <span style="color:#4ade80">${u.success_count || 0} ✓</span>
                                        ${u.failure_count > 0 ? `<span style="color:#f87171;margin-left:0.5rem">${u.failure_count} ✗</span>` : ''}
                                        ${u.missing_count > 0 ? `<span style="color:#fbbf24;margin-left:0.5rem">${u.missing_count} pending</span>` : ''}
                                    ` : `<span style="color:var(--dash-text-muted)">—</span>`}
                                </td>
                                <td>
                                    <div class="flex gap-2 flex-wrap">
                                        ${u.status === 'draft' ? (testServers.length > 0 ? `
                                        <!-- Test Button with Server Selection -->
                                        <div class="relative inline-block" x-data="{ open: false }">
                                            <button @click="open = !open" type="button" class="admin-btn admin-btn-orange">
                                                Test
                                            </button>
                                            <div x-show="open" @click.away="open = false"
                                                class="absolute z-50 mt-1 w-64 rounded-lg shadow-xl"
                                                style="background:var(--dash-card-bg);border:1px solid var(--dash-card-border)">
                                                <form method="POST" action="/admin/updates/${u.id}/test" class="p-3">
                                                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                                                    <label class="block text-xs mb-2" style="color:var(--dash-text-secondary)">Select test server:</label>
                                                    <select name="serverId" required class="admin-input text-xs mb-2" style="font-size:0.75rem;padding:0.25rem 0.5rem">
                                                        ${testServers.map(s => `<option value="${s.id}">${escapeHtml(s.ip_address)} (${escapeHtml(s.owner_email || 'unknown')})</option>`).join('')}
                                                    </select>
                                                    <button type="submit" class="admin-btn admin-btn-orange w-full" style="justify-content:center">
                                                        Run Test
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                        ` : `
                                        <span class="text-xs" style="color:#fbbf24" title="No running servers available for testing">
                                            No test servers
                                        </span>
                                        `) : ''}

                                        ${u.status === 'tested' ? `
                                        <form method="POST" action="/admin/updates/${u.id}/release" class="inline">
                                            <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                                            <button type="submit" class="admin-btn admin-btn-green"
                                                onclick="return confirm('Release this update? Customers will be able to apply it.')">
                                                Release
                                            </button>
                                        </form>
                                        ` : ''}

                                        ${u.status === 'released' && u.missing_count > 0 ? `
                                        <form method="POST" action="/admin/updates/${u.id}/push" class="inline">
                                            <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                                            <button type="submit" class="admin-btn admin-btn-orange"
                                                onclick="return confirm('Push to ${u.missing_count} servers?')">
                                                Push All
                                            </button>
                                        </form>
                                        ` : ''}

                                        ${u.status === 'released' && u.failure_count > 0 ? `
                                        <form method="POST" action="/admin/updates/${u.id}/retry" class="inline">
                                            <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                                            <button type="submit" class="admin-btn admin-btn-primary">
                                                Retry Failed
                                            </button>
                                        </form>
                                        ` : ''}

                                        ${u.status === 'released' ? `
                                        <form method="POST" action="/admin/updates/${u.id}/archive" class="inline">
                                            <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                                            <button type="submit" class="admin-btn"
                                                onclick="return confirm('Archive this update?')">
                                                Archive
                                            </button>
                                        </form>
                                        ` : ''}

                                        ${u.status === 'draft' || u.status === 'archived' ? `
                                        <form method="POST" action="/admin/updates/${u.id}/delete" class="inline">
                                            <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                                            <button type="submit" class="admin-btn admin-btn-red"
                                                onclick="return confirm('Delete this update?')">
                                                Delete
                                            </button>
                                        </form>
                                        ` : ''}

                                        <a href="/admin/updates/${u.id}" class="admin-btn">View</a>
                                    </div>
                                </td>
                            </tr>
                            `;}).join('')}
                        </tbody>
                    </table>
                </div>
                `}
            </div>
        </div>
    </main>
    </div>

    ${getFooter()}
    <script nonce="${getNonce()}" src="https://unpkg.com/alpinejs@3.14.1/dist/cdn.min.js" defer integrity="sha384-l8f0VcPi/M1iHPv8egOnY/15TDwqgbOR1anMIJWvU6nLRgZVLTLSaNqi/TOoT5Fh" crossorigin="anonymous"></script>
    ${getScripts('nav.js', 'dashboard.js')}
    `);
  } catch (error) {
    console.error('Admin updates error:', error);
    res.status(500).send('Failed to load updates page');
  }
};

// ============================================================
// GET /admin/updates/:id - Update Detail View
// ============================================================
const showUpdateDetail = async (req, res) => {
  try {
    const updateId = parseInt(req.params.id, 10);
    if (isNaN(updateId)) {
      return res.redirect('/admin/updates?error=Invalid update ID');
    }
    
    const update = await serverUpdates.getUpdateById(updateId);
    if (!update) {
      return res.redirect('/admin/updates?error=Update not found');
    }
    
    const testResults = await serverUpdates.getTestResults(updateId);
    const testServers = await serverUpdates.getEligibleTestServers();
    const status = STATUS_BADGES[update.status] || STATUS_BADGES.draft;
    const type = TYPE_STYLES[update.type] || TYPE_STYLES.config;
    
    // Get execution logs if released
    let executionLogs = [];
    if (update.status === 'released') {
      const logsResult = await pool.query(`
        SELECT sul.*, s.ip_address, u.email as triggered_by_email
        FROM server_update_log sul
        JOIN servers s ON sul.server_id = s.id
        LEFT JOIN users u ON sul.triggered_by = u.id
        WHERE sul.update_id = $1
        ORDER BY sul.applied_at DESC
        LIMIT 50
      `, [updateId]);
      executionLogs = logsResult.rows;
    }

    res.send(`
${getHTMLHead(`Update: ${update.title} - Admin`)}
    ${getResponsiveNav(req)}

    <div class="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div class="mb-6">
            <a href="/admin/updates" class="text-sm hover:text-white" style="color:var(--dash-text-secondary)">← Back to Updates</a>
        </div>
        
        ${req.query.success ? `
        <div class="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
            ${escapeHtml(req.query.success)}
        </div>
        ` : ''}
        
        ${req.query.error ? `
        <div class="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            ${escapeHtml(req.query.error)}
        </div>
        ` : ''}

        <!-- Update Header -->
        <div class="admin-card p-6 mb-6">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h1 class="text-xl font-bold" style="color:var(--dash-text-primary)">${escapeHtml(update.title)}</h1>
                    <p class="text-sm" style="color:var(--dash-text-muted)">${escapeHtml(update.description || 'No description')}</p>
                </div>
                <span class="${status.cls}">${status.label}</span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <span style="color:var(--dash-text-muted);font-size:0.75rem">Type</span>
                    <div class="flex items-center gap-1.5 ${type.text}" style="margin-top:0.25rem">
                        <span class="w-2 h-2 rounded-full ${type.dot}"></span>
                        ${update.type}
                        ${update.is_critical ? '<span class="text-red-400">⚠️</span>' : ''}
                    </div>
                </div>
                <div>
                    <span style="color:var(--dash-text-muted);font-size:0.75rem">Version</span>
                    <div style="color:var(--dash-text-primary);margin-top:0.25rem">${update.version || '—'}</div>
                </div>
                <div>
                    <span style="color:var(--dash-text-muted);font-size:0.75rem">Created</span>
                    <div style="color:var(--dash-text-primary);margin-top:0.25rem">${new Date(update.created_at).toLocaleString()}</div>
                </div>
                <div>
                    <span style="color:var(--dash-text-muted);font-size:0.75rem">Hash</span>
                    <div style="color:var(--dash-text-secondary);font-family:monospace;font-size:0.6875rem;margin-top:0.25rem">${update.script_hash ? update.script_hash.substring(0, 16) + '...' : '—'}</div>
                </div>
            </div>
        </div>

        <!-- Script -->
        <div class="admin-card p-6 mb-6">
            <h3 class="admin-section-title">Script (Immutable)</h3>
            <pre style="background:rgba(0,0,0,0.5);padding:1rem;border-radius:0.375rem;overflow-x:auto;font-size:0.8125rem;font-family:monospace;color:#a3e635">${escapeHtml(update.script)}</pre>
            <p class="text-xs mt-2" style="color:var(--dash-text-muted)">This script cannot be edited. To change it, create a new update.</p>
        </div>

        <!-- Actions -->
        <div class="admin-card p-6 mb-6">
            <h3 class="admin-section-title">Actions</h3>
            <div class="flex gap-3 flex-wrap">
                ${update.status === 'draft' ? (testServers.length > 0 ? `
                <form method="POST" action="/admin/updates/${update.id}/test" class="flex items-center gap-2">
                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                    <select name="serverId" required class="admin-input" style="width:auto;font-size:0.875rem">
                        <option value="">Select test server...</option>
                        ${testServers.map(s => `<option value="${s.id}">${escapeHtml(s.hostname || s.ip_address)}</option>`).join('')}
                    </select>
                    <button type="submit" class="admin-btn admin-btn-orange" style="padding:0.5rem 1rem;font-size:0.875rem">
                        Test on Server
                    </button>
                </form>
                ` : `
                <span class="text-sm" style="padding:0.5rem 0.75rem;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.2);border-radius:0.375rem;color:#fbbf24">
                    No running servers available for testing
                </span>
                `) : ''}

                ${update.status === 'tested' ? `
                <form method="POST" action="/admin/updates/${update.id}/release" class="inline">
                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                    <button type="submit" class="admin-btn admin-btn-green" style="padding:0.5rem 1rem;font-size:0.875rem"
                        onclick="return confirm('Release this update?')">
                        Release Update
                    </button>
                </form>
                ` : ''}

                ${update.status === 'released' ? `
                <form method="POST" action="/admin/updates/${update.id}/push" class="inline">
                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                    <button type="submit" class="admin-btn admin-btn-orange" style="padding:0.5rem 1rem;font-size:0.875rem"
                        onclick="return confirm('Push to all pending servers?')">
                        Push to All
                    </button>
                </form>
                <form method="POST" action="/admin/updates/${update.id}/retry" class="inline">
                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                    <button type="submit" class="admin-btn admin-btn-primary" style="padding:0.5rem 1rem;font-size:0.875rem">
                        Retry Failed
                    </button>
                </form>
                <form method="POST" action="/admin/updates/${update.id}/archive" class="inline">
                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                    <button type="submit" class="admin-btn" style="padding:0.5rem 1rem;font-size:0.875rem"
                        onclick="return confirm('Archive this update?')">
                        Archive
                    </button>
                </form>
                ` : ''}

                ${(update.status === 'draft' || update.status === 'archived') ? `
                <form method="POST" action="/admin/updates/${update.id}/delete" class="inline">
                    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
                    <button type="submit" class="admin-btn admin-btn-red" style="padding:0.5rem 1rem;font-size:0.875rem"
                        onclick="return confirm('Permanently delete this update?')">
                        Delete
                    </button>
                </form>
                ` : ''}
            </div>
        </div>

        <!-- Test Results -->
        ${testResults.length > 0 ? `
        <div class="admin-card p-6 mb-6">
            <h3 class="admin-section-title">Test Results (${testResults.length})</h3>
            <div class="space-y-3">
                ${testResults.map(t => `
                <div style="background:rgba(0,0,0,0.3);padding:1rem;border-radius:0.5rem">
                    <div class="flex items-center justify-between mb-2">
                        <span style="color:var(--dash-text-primary);font-weight:500">${escapeHtml(t.ip_address)}</span>
                        <span class="admin-badge ${t.success ? 'admin-badge-green' : 'admin-badge-red'}">
                            ${t.success ? '✓ Passed' : '✗ Failed'} (exit ${t.exit_code})
                        </span>
                    </div>
                    <div class="text-xs" style="color:var(--dash-text-muted)">
                        Tested by ${escapeHtml(t.tested_by_email || 'unknown')} · ${new Date(t.tested_at).toLocaleString()} · ${t.execution_time_ms}ms
                    </div>
                    ${t.stdout || t.stderr ? `
                    <details class="mt-2">
                        <summary class="text-xs cursor-pointer" style="color:var(--dash-text-secondary)">View output</summary>
                        <pre style="margin-top:0.5rem;font-size:0.6875rem;background:rgba(0,0,0,0.5);padding:0.5rem;border-radius:0.25rem;overflow-x:auto;color:${t.success ? '#a3e635' : '#f87171'}">${escapeHtml((t.stdout || '') + (t.stderr ? '\n[stderr]\n' + t.stderr : ''))}</pre>
                    </details>
                    ` : ''}
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Execution Logs -->
        ${executionLogs.length > 0 ? `
        <div class="admin-card p-6">
            <h3 class="admin-section-title">Execution Log (${executionLogs.length})</h3>
            <div class="overflow-x-auto">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Server</th>
                            <th>Status</th>
                            <th>Triggered</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${executionLogs.map(l => `
                        <tr>
                            <td style="color:var(--dash-text-primary)">${escapeHtml(l.ip_address)}</td>
                            <td>
                                <span style="color:${l.status === 'success' ? '#4ade80' : '#f87171'}">
                                    ${l.status === 'success' ? '✓' : '✗'} ${l.status}
                                </span>
                            </td>
                            <td style="color:var(--dash-text-muted)">${l.trigger_type || '—'}</td>
                            <td style="color:var(--dash-text-muted)">${new Date(l.applied_at).toLocaleString()}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
    </div>

    ${getFooter()}
    ${getScripts('nav.js')}
    `);
  } catch (error) {
    console.error('Update detail error:', error);
    res.redirect('/admin/updates?error=Failed to load update');
  }
};

// ============================================================
// POST Handlers
// ============================================================

const createUpdate = async (req, res) => {
  // Valid update types
  const VALID_TYPES = ['security', 'config', 'feature', 'script'];
  const MAX_TITLE_LENGTH = 200;
  const MAX_DESCRIPTION_LENGTH = 2000;
  const MAX_SCRIPT_LENGTH = 50000;
  const MAX_VERSION_LENGTH = 50;
  
  try {
    const { title, description, script, type, version, isCritical } = req.body;
    
    if (!title?.trim()) {
      return res.redirect('/admin/updates?error=Title is required');
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return res.redirect('/admin/updates?error=Title too long (max ' + MAX_TITLE_LENGTH + ' chars)');
    }
    if (!script?.trim()) {
      return res.redirect('/admin/updates?error=Script is required');
    }
    if (script.length > MAX_SCRIPT_LENGTH) {
      return res.redirect('/admin/updates?error=Script too large (max ' + MAX_SCRIPT_LENGTH + ' chars)');
    }
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      return res.redirect('/admin/updates?error=Description too long (max ' + MAX_DESCRIPTION_LENGTH + ' chars)');
    }
    if (version && version.length > MAX_VERSION_LENGTH) {
      return res.redirect('/admin/updates?error=Version too long (max ' + MAX_VERSION_LENGTH + ' chars)');
    }
    // Validate type if provided
    const validatedType = type && VALID_TYPES.includes(type) ? type : 'config';
    
    const result = await serverUpdates.createUpdate({
      title: title.trim(),
      description: description?.trim() || null,
      script: script.trim(),
      type: validatedType,
      version: version?.trim() || null,
      isCritical: isCritical === 'on',
      createdBy: req.session.userId
    });
    
    const warningMsg = result.warnings.length > 0 
      ? `&warning=${encodeURIComponent('Warnings: ' + result.warnings.join('; '))}` 
      : '';
    
    res.redirect(`/admin/updates?success=Update created as DRAFT. Test it before release.${warningMsg}`);
  } catch (error) {
    console.error('Create update error:', error);
    res.redirect('/admin/updates?error=' + encodeURIComponent(error.message));
  }
};

const testUpdate = async (req, res) => {
  try {
    const updateId = parseInt(req.params.id, 10);
    const serverId = parseInt(req.body.serverId, 10);
    
    if (isNaN(updateId) || isNaN(serverId)) {
      return res.redirect('/admin/updates?error=Invalid update or server ID');
    }
    
    const result = await serverUpdates.testUpdateOnServer(updateId, serverId, req.session.userId);
    
    if (result.success) {
      res.redirect(`/admin/updates/${updateId}?success=Test passed! Exit code ${result.exitCode}. Ready for release.`);
    } else {
      res.redirect(`/admin/updates/${updateId}?error=Test failed with exit code ${result.exitCode}`);
    }
  } catch (error) {
    console.error('Test update error:', error);
    res.redirect(`/admin/updates/${req.params.id}?error=` + encodeURIComponent(error.message));
  }
};

const releaseUpdate = async (req, res) => {
  try {
    const updateId = parseInt(req.params.id, 10);
    if (isNaN(updateId)) {
      return res.redirect('/admin/updates?error=Invalid update ID');
    }
    
    await serverUpdates.releaseUpdate(updateId, req.session.userId);
    res.redirect(`/admin/updates?success=Update released! Customers can now apply it.`);
  } catch (error) {
    console.error('Release update error:', error);
    res.redirect('/admin/updates?error=' + encodeURIComponent(error.message));
  }
};

const pushUpdate = async (req, res) => {
  try {
    const updateId = parseInt(req.params.id, 10);
    if (isNaN(updateId)) {
      return res.redirect('/admin/updates?error=Invalid update ID');
    }
    
    const result = await serverUpdates.pushUpdateToAll(updateId, req.session.userId);
    
    if (result.pushed === 0) {
      res.redirect('/admin/updates?success=All servers already have this update');
    } else {
      res.redirect(`/admin/updates?success=Pushed to ${result.pushed} servers: ${result.successCount} success, ${result.failCount} failed`);
    }
  } catch (error) {
    console.error('Push update error:', error);
    res.redirect('/admin/updates?error=' + encodeURIComponent(error.message));
  }
};

const retryFailedServers = async (req, res) => {
  try {
    const updateId = parseInt(req.params.id, 10);
    if (isNaN(updateId)) {
      return res.redirect('/admin/updates?error=Invalid update ID');
    }
    
    const results = await serverUpdates.retryFailedServers(updateId, req.session.userId);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    res.redirect(`/admin/updates?success=Retry complete: ${successCount} success, ${failCount} still failing`);
  } catch (error) {
    console.error('Retry failed error:', error);
    res.redirect('/admin/updates?error=' + encodeURIComponent(error.message));
  }
};

const archiveUpdate = async (req, res) => {
  try {
    const updateId = parseInt(req.params.id, 10);
    if (isNaN(updateId)) {
      return res.redirect('/admin/updates?error=Invalid update ID');
    }
    
    await serverUpdates.archiveUpdate(updateId, req.session.userId);
    res.redirect('/admin/updates?success=Update archived');
  } catch (error) {
    console.error('Archive update error:', error);
    res.redirect('/admin/updates?error=' + encodeURIComponent(error.message));
  }
};

const deleteUpdate = async (req, res) => {
  try {
    const updateId = parseInt(req.params.id, 10);
    if (isNaN(updateId)) {
      return res.redirect('/admin/updates?error=Invalid update ID');
    }
    
    await serverUpdates.deleteUpdate(updateId, req.session.userId);
    res.redirect('/admin/updates?success=Update deleted');
  } catch (error) {
    console.error('Delete update error:', error);
    res.redirect('/admin/updates?error=' + encodeURIComponent(error.message));
  }
};

const toggleKillSwitch = async (req, res) => {
  try {
    const isActive = await serverUpdates.isKillSwitchActive();
    await serverUpdates.setKillSwitch(!isActive, req.session.userId);
    
    res.redirect(`/admin/updates?success=${isActive ? 'Executions resumed' : 'KILL SWITCH ACTIVATED - all executions paused'}`);
  } catch (error) {
    console.error('Kill switch error:', error);
    res.redirect('/admin/updates?error=' + encodeURIComponent(error.message));
  }
};

// GET /admin/updates/data - JSON API for React admin updates dashboard
const getUpdatesData = async (req, res) => {
  try {
    const [updates, killSwitchActive, testServers, serversResult] = await Promise.all([
      serverUpdates.getAllUpdates(),
      serverUpdates.isKillSwitchActive(),
      serverUpdates.getEligibleTestServers(),
      pool.query("SELECT COUNT(*) FROM servers WHERE status = 'running'"),
    ]);

    res.json({
      csrfToken: req.csrfToken(),
      updates,
      killSwitchActive,
      testServers,
      totalServers: parseInt(serversResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Admin updates data API error:', error);
    res.status(500).json({ error: 'Failed to load updates data' });
  }
};

module.exports = {
  showUpdates,
  showUpdateDetail,
  createUpdate,
  testUpdate,
  releaseUpdate,
  pushUpdate,
  retryFailedServers,
  archiveUpdate,
  deleteUpdate,
  toggleKillSwitch,
  getUpdatesData,
};
