const pool = require('../db');
const { getDashboardHead, getFooter, getScripts, getResponsiveNav } = require('../helpers');

exports.showGettingStarted = async (req, res) => {
  // Check payment and server status
  try {
    const paymentCheck = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      [req.session.userId, 'succeeded']
    );
    
    const hasPaid = paymentCheck.rows.length > 0;
    const plan = hasPaid ? paymentCheck.rows[0].plan : null;
    
    const serverCheck = await pool.query(
      'SELECT * FROM servers WHERE user_id = $1',
      [req.session.userId]
    );
    
    const hasServer = serverCheck.rows.length > 0;
    
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [req.session.userId]
    );
    const userEmail = userResult.rows[0].email;
  
  res.send(`
${getDashboardHead('Getting Started - Clouded Basement')}
</head>
<body>
    <div class="matrix-bg"></div>
    
    ${getResponsiveNav(req)}
    
    <div class="wizard-container">
      <h1 style="text-align: center; margin-bottom: 48px; color: #fff; font-size: 36px;">Welcome to Clouded Basement</h1>
      
      <div class="wizard-steps">
        <div class="wizard-step">
          <div class="step-circle ${hasPaid ? 'completed' : 'active'}">1</div>
          <span class="step-label ${!hasPaid ? 'active' : ''}">Payment</span>
        </div>
        <div class="wizard-step">
          <div class="step-circle ${hasServer ? 'active' : ''}">2</div>
          <span class="step-label ${hasServer ? 'active' : ''}">Deploy</span>
        </div>
      </div>
      
      ${!hasPaid ? `
        <div class="onboarding-card">
          <h2>Step 1: Choose Your Plan</h2>
          <p>You're almost there! To get started, you'll need to select a hosting plan.</p>
          
          <div class="bg-cyan-900/10 border border-cyan-500/20 rounded-lg p-6 my-6">
            <p class="text-gray-400"><strong class="text-cyan-400">Founder Plan:</strong> $10/month for life — Lock in this price forever. Only 10 spots available!</p>
          </div>
          
          <ul class="checklist">
            <li>1GB RAM, 25GB SSD Storage</li>
            <li>Full SSH Root Access</li>
            <li>Pre-installed: Node.js, Python, Git, Nginx</li>
            <li>Custom Domain + Free SSL</li>
            <li>Direct support from the founder</li>
          </ul>
          
          <div class="btn-group">
            <a href="/pricing" class="btn primary">View Plans & Purchase</a>
            <a href="/docs" class="btn">Learn More</a>
          </div>
        </div>
      ` : !hasServer ? `
        <div class="onboarding-card">
          <h2>Step 2: Server Provisioning</h2>
          <p>Great! Your ${plan} plan is confirmed. Your server is being created automatically.</p>
          
          <div style="background: rgba(45, 167, 223, 0.1); border: 2px solid #2DA7DF; border-radius: 8px; padding: 32px; text-align: center; margin: 24px 0;">
            <h3 style="color: #2DA7DF; margin-top: 0; font-size: 20px;">⏳ Server Provisioning in Progress</h3>
            <p style="color: #e0e6f0; margin-bottom: 16px;">We're automatically setting up your server! You'll receive an email at <strong>${userEmail}</strong> when it's ready.</p>
            <p style="color: #8892a0; font-size: 14px; margin: 0;">Estimated completion: 5-10 minutes</p>
            <p style="color: #8892a0; font-size: 14px; margin-top: 8px;">Please check back shortly or wait for the email notification.</p>
          </div>
          
          <div class="bg-cyan-900/10 border border-cyan-500/20 rounded-lg p-6 my-6">
            <p class="text-gray-400"><strong class="text-white">What's happening:</strong> Your DigitalOcean droplet is being created and configured with SSH access, Node.js, Python, Git, and Nginx.</p>
          </div>
          
          <p style="text-align: center; margin-top: 24px; color: #8892a0; font-size: 14px;">
            Questions? Email <a href="mailto:support@cloudedbasement.ca" style="color: #2DA7DF; text-decoration: none;">support@cloudedbasement.ca</a>
          </p>
        </div>
      ` : `
        <div class="onboarding-card">
          <h2>🎉 Your Server is Ready!</h2>
          <p>Congrats! Your server is set up and ready to use.</p>
          
          <ul class="checklist">
            <li>Check your email for SSH credentials</li>
            <li>Connect via SSH: <code style="background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 3px;">ssh root@your-server-ip</code></li>
            <li>Deploy your first app using our guides</li>
            <li>Add a custom domain (optional)</li>
          </ul>
          
          <div class="btn-group">
            <a href="/dashboard" class="btn primary">Go to Dashboard</a>
            <a href="/docs" class="btn">View Documentation</a>
          </div>
        </div>
      `}
    </div>
    
    ${getFooter()}
</body>
</html>
  `);
  
  } catch (err) {
    console.error('Getting started page error:', err);
    res.status(500).send('Server error');
  }
};
