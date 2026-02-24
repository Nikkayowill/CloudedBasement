export const pricingData = [
  {
    id: 'basic',
    name: 'Basic',
    desc: 'Side projects & personal apps',
    price: '$15',
    period: '/mo',
    features: [
      '1 GB RAM · 1 vCPU',
      '25 GB NVMe SSD · 1 TB BW',
      '2 custom domains',
      'GitHub auto-deploy',
      'Free SSL & SSH access',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    desc: 'Production apps & growing projects',
    price: '$35',
    period: '/mo',
    features: [
      '2 GB RAM · 2 vCPUs',
      '60 GB NVMe SSD · 3 TB BW',
      '5 custom domains',
      'GitHub auto-deploy',
      'Free SSL & SSH access',
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
    desc: 'Established apps & high traffic',
    price: '$65',
    period: '/mo',
    features: [
      '4 GB RAM · 2 vCPUs',
      '80 GB NVMe SSD · 4 TB BW',
      '10 custom domains',
      'GitHub auto-deploy',
      'Free SSL & SSH access',
    ],
    adds: [
      'Daily automatic backups',
      'Direct developer support',
    ],
  },
];
