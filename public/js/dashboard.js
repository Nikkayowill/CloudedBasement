// Copy to clipboard functionality - accepts element ID or direct text
function copyToClipboard(elementIdOrText, buttonElement) {
    let textToCopy;
    
    // Check if it's an element ID
    const element = document.getElementById(elementIdOrText);
    if (element) {
        textToCopy = element.value || element.textContent;
    } else {
        // It's direct text
        textToCopy = elementIdOrText;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback on button
        if (buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✓';
            buttonElement.classList.add('bg-green-600');
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.classList.remove('bg-green-600');
            }, 1500);
        } else {
            alert('Copied to clipboard!');
        }
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

// Toggle password visibility
function togglePassword(elementId, buttonElement) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (element.type === 'password') {
        element.type = 'text';
        if (buttonElement) buttonElement.textContent = 'Hide';
    } else {
        element.type = 'password';
        if (buttonElement) buttonElement.textContent = 'Show';
    }
}

// Refresh dashboard manually
function refreshDashboard() {
    window.location.reload();
}

// Toggle deployment log visibility
function toggleDeploymentLog(deploymentId) {
    const logRow = document.getElementById(`deployment-log-${deploymentId}`);
    if (logRow) {
        logRow.classList.toggle('hidden');
    }
}

// Dismiss next steps banner
async function dismissNextSteps() {
    try {
        const response = await fetch('/dashboard/dismiss-next-steps', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const banner = document.getElementById('nextStepsBanner');
            if (banner) {
                banner.style.transition = 'opacity 0.3s';
                banner.style.opacity = '0';
                setTimeout(() => banner.remove(), 300);
            }
        }
    } catch (error) {
        console.error('Error dismissing banner:', error);
    }
}

// Auto-refresh dashboard every 15 seconds if server is provisioning
const serverStatusElement = document.querySelector('[data-server-status]');
if (serverStatusElement) {
    const serverStatus = serverStatusElement.dataset.serverStatus;
    
    if (serverStatus === 'provisioning') {
        console.log('Server is provisioning, will auto-refresh in 15 seconds...');
        setTimeout(() => {
            console.log('Auto-refreshing dashboard to check server status...');
            window.location.reload();
        }, 15000); // 15 seconds
    }
}

// Auto-fade alerts after 5 seconds
setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        alert.style.transition = 'opacity 0.5s';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    });
}, 5000);

// Poll deployment status for active deployments
function pollDeploymentStatus() {
    const activeDeployments = document.querySelectorAll('[data-deployment-id]');
    
    activeDeployments.forEach(async (element) => {
        const deploymentId = element.dataset.deploymentId;
        const status = element.dataset.deploymentStatus;
        
        // Only poll if status is pending or deploying
        if (status === 'pending' || status === 'deploying') {
            try {
                const response = await fetch(`/api/deployment-status/${deploymentId}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    // Update status badge
                    const statusBadge = element.querySelector('.deployment-status-badge');
                    if (statusBadge && data.status !== status) {
                        const spinner = (data.status === 'pending' || data.status === 'deploying') ? 
                            `<svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>` : '';
                        const displayStatus = data.status === 'pending' ? 'Building' : data.status === 'deploying' ? 'Deploying' : data.status.toUpperCase();
                        statusBadge.innerHTML = spinner + displayStatus;
                        statusBadge.className = `deployment-status-badge px-2 py-1 text-xs font-bold uppercase rounded inline-flex items-center gap-2 ${
                            data.status === 'success' ? 'bg-green-900 text-green-300' : 
                            data.status === 'failed' ? 'bg-red-900 text-red-300' : 
                            'bg-yellow-900 text-yellow-300'
                        }`;
                        element.dataset.deploymentStatus = data.status;
                    }
                    
                    // Update output if it exists (in the log row, not the main row)
                    const logRow = document.getElementById(`deployment-log-${deploymentId}`);
                    if (logRow) {
                        const outputElement = logRow.querySelector('.deployment-output');
                        if (outputElement && data.output) {
                            outputElement.textContent = data.output;
                            // Auto-scroll to bottom
                            outputElement.scrollTop = outputElement.scrollHeight;
                        }
                    }
                    
                    // Reload page if deployment finished
                    if (data.status === 'success' || data.status === 'failed') {
                        setTimeout(() => window.location.reload(), 2000);
                    }
                }
            } catch (error) {
                console.error('Error polling deployment:', error);
            }
        }
    });
}

// Start polling if there are active deployments
if (document.querySelector('[data-deployment-status="pending"], [data-deployment-status="deploying"]')) {
    pollDeploymentStatus(); // Poll immediately
    setInterval(pollDeploymentStatus, 3000); // Then every 3 seconds
}

// Add loading states to forms
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        const btn = this.querySelector('button[type="submit"]');
        if (btn && !btn.classList.contains('btn-loading')) {
            btn.classList.add('btn-loading');
            btn.disabled = true;
        }
    });
});
