export const pricingData = [
  {
    id: 'basic',
    name: 'Basic',
    desc: 'A solid server for side projects and early builds',
    monthly: { price: '$15', period: '/mo' },
    yearly: { price: '$162', period: '/yr', perMonth: '$13.50' },
    features: [
      '1 GB RAM - 1 vCPU',
      '25 GB NVMe SSD - 1 TB bandwidth',
      '2 custom domains',
      'GitHub auto-deploy',
      'Free SSL and SSH access',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    desc: 'A production-ready server for your main project',
    monthly: { price: '$35', period: '/mo' },
    yearly: { price: '$378', period: '/yr', perMonth: '$31.50' },
    features: [
      '2 GB RAM - 2 vCPUs',
      '60 GB NVMe SSD - 3 TB bandwidth',
      '5 custom domains',
      'GitHub auto-deploy',
      'Free SSL and SSH access',
    ],
    adds: [
      'Weekly automatic backups',
      'Priority support (12 hr)',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    desc: 'More resources and support for teams that are growing',
    monthly: { price: '$65', period: '/mo' },
    yearly: { price: '$702', period: '/yr', perMonth: '$58.50' },
    features: [
      '4 GB RAM - 2 vCPUs',
      '80 GB NVMe SSD - 4 TB bandwidth',
      '10 custom domains',
      'GitHub auto-deploy',
      'Free SSL and SSH access',
    ],
    adds: [
      'Daily automatic backups',
      'Direct developer support',
    ],
  },
];
