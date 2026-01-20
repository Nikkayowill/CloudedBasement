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
    ${getResponsiveNav(req)}
    
    <main class="bg-gray-900 min-h-screen py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-extrabold text-white text-center mb-12">Welcome to Clouded Basement</h1>
        
        <div class="flex items-center justify-center gap-8 mb-12">
          <div class="flex flex-col items-center gap-2">
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${hasPaid ? 'bg-green-600 text-white' : 'bg-brand text-gray-900'}">1</div>
            <span class="text-sm font-medium ${!hasPaid ? 'text-brand' : 'text-gray-400'}">Payment</span>
          </div>
          <div class="w-24 h-1 ${hasPaid ? 'bg-brand' : 'bg-gray-700'}"></div>
          <div class="flex flex-col items-center gap-2">
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${hasServer ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}">2</div>
            <span class="text-sm font-medium ${hasServer ? 'text-brand' : 'text-gray-400'}">Deploy</span>
          </div>
        </div>
        
        ${!hasPaid ? `
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <h2 class="text-2xl font-bold text-white mb-4">Step 1: Choose Your Plan</h2>
            <p class="text-gray-400 mb-6">You're almost there! To get started, you'll need to select a hosting plan.</p>
            
            <div class="bg-gray-700 border border-gray-600 rounded-lg p-6 mb-6">
              <p class="text-gray-400"><strong class="text-brand">Founder Plan:</strong> $10/month for life — Lock in this price forever. Only 10 spots available!</p>
            </div>
            
            <ul class="space-y-2 text-gray-400 mb-8">
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> 1GB RAM, 25GB SSD Storage</li>
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> Full SSH Root Access</li>
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> Pre-installed: Node.js, Python, Git, Nginx</li>
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> Custom Domain + Free SSL</li>
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> Direct support from the founder</li>
            </ul>
            
            <div class="flex gap-4">
              <a href="/pricing" class="px-8 py-3 bg-brand text-gray-900 font-bold rounded-lg hover:bg-cyan-500 transition-colors">View Plans & Purchase</a>
              <a href="/docs" class="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">Learn More</a>
            </div>
          </div>
        ` : !hasServer ? `
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <h2 class="text-2xl font-bold text-white mb-4">Step 2: Server Provisioning</h2>
            <p class="text-gray-400 mb-6">Great! Your ${plan} plan is confirmed. Your server is being created automatically.</p>
            
            <div class="bg-brand bg-opacity-10 border-2 border-brand rounded-lg p-8 text-center mb-6">
              <h3 class="text-brand text-xl font-bold mb-4">⏳ Server Provisioning in Progress</h3>
              <p class="text-gray-300 mb-4">We're automatically setting up your server! You'll receive an email at <strong>${userEmail}</strong> when it's ready.</p>
              <p class="text-gray-400 text-sm mb-2">Estimated completion: 5-10 minutes</p>
              <p class="text-gray-400 text-sm">Please check back shortly or wait for the email notification.</p>
            </div>
            
            <div class="bg-gray-700 border border-gray-600 rounded-lg p-6 mb-6">
              <p class="text-gray-400"><strong class="text-white">What's happening:</strong> Your DigitalOcean droplet is being created and configured with SSH access, Node.js, Python, Git, and Nginx.</p>
            </div>
            
            <p class="text-center text-gray-400 text-sm">
              Questions? Email <a href="mailto:support@cloudedbasement.ca" class="text-brand hover:text-cyan-400">support@cloudedbasement.ca</a>
            </p>
          </div>
        ` : `
          <div class="bg-gray-800 border border-green-700 rounded-lg p-8">
            <h2 class="text-2xl font-bold text-white mb-4">🎉 Your Server is Ready!</h2>
            <p class="text-gray-400 mb-6">Congrats! Your server is set up and ready to use.</p>
            
            <ul class="space-y-2 text-gray-400 mb-8">
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> Check your email for SSH credentials</li>
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> Connect via SSH: <code class="bg-gray-900 px-2 py-1 rounded text-brand">ssh root@your-server-ip</code></li>
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> Deploy your first app using our guides</li>
              <li class="flex items-start gap-2"><span class="text-brand">✓</span> Add a custom domain (optional)</li>
            </ul>
            
            <div class="flex gap-4">
              <a href="/dashboard" class="px-8 py-3 bg-brand text-gray-900 font-bold rounded-lg hover:bg-cyan-500 transition-colors">Go to Dashboard</a>
              <a href="/docs" class="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors">View Documentation</a>
            </div>
          </div>
        `}
      </div>
    </main>
    
    ${getFooter()}
    ${getScripts('nav.js')}
  `);
  
  } catch (err) {
    console.error('Getting started page error:', err);
    res.status(500).send('Server error');
  }
};
