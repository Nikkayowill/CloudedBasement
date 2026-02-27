import { GitBranchIcon, LockIcon, DatabaseIcon, GlobeIcon, ArchiveIcon, TerminalIcon, CodeIcon, LayersIcon } from 'lucide-react';

export const featuresData = [
  {
    Icon: GitBranchIcon,
    title: 'Push to deploy',
    body: 'Connect your GitHub repo once. Every push to main triggers a fresh deploy — no CI setup, no YAML files.',
  },
  {
    Icon: LockIcon,
    title: 'Free SSL, automatic',
    body: "Every domain gets a Let's Encrypt certificate, provisioned and renewed automatically by Certbot.",
  },
  {
    Icon: DatabaseIcon,
    title: 'One-click databases',
    body: 'Install PostgreSQL or MongoDB from the dashboard. Credentials generated, connection string ready.',
  },
  {
    Icon: GlobeIcon,
    title: 'Custom domains',
    body: 'Point your DNS, we validate and configure Nginx. 2–10 custom domains per plan.',
  },
  {
    Icon: ArchiveIcon,
    title: 'Automatic backups',
    body: 'Pro gets weekly snapshots. Premium gets daily. Retained for 7 days and restorable in one click.',
  },
  {
    Icon: TerminalIcon,
    title: 'SSH & root access',
    body: "It's your server. Full root access via SSH — install anything, configure everything.",
  },
  {
    Icon: CodeIcon,
    title: 'Multi-language',
    body: 'Node.js, Python, Go, and Rust are pre-installed on every server. Any framework that runs on Linux works.',
  },
  {
    Icon: LayersIcon,
    title: 'Multi-site hosting',
    body: 'Run up to 10 sites on one server. Each domain gets its own Nginx config and SSL certificate.',
  },
];
