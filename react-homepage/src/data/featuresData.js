import { GitBranchIcon, LockIcon, DatabaseIcon, GlobeIcon, ArchiveIcon, TerminalIcon, CodeIcon, LayersIcon } from 'lucide-react';

export const featuresData = [
  {
    Icon: GitBranchIcon,
    title: 'Push to deploy',
    body: 'Connect your GitHub repo once. Every push to main triggers a fresh deploy — no CI pipelines, no build configs, no waiting. Your code goes from commit to live in seconds.',
  },
  {
    Icon: DatabaseIcon,
    title: 'One-click databases',
    body: 'Install PostgreSQL or MongoDB from your dashboard. Credentials generated, connection string ready. No manual setup, no separate billing — it just runs on your server.',
  },
  {
    Icon: LockIcon,
    title: 'Automatic SSL & custom domains',
    body: "Point your DNS, we handle the rest. Every domain gets a Let's Encrypt certificate, provisioned and renewed automatically. Up to 10 custom domains per server.",
  },
  {
    Icon: TerminalIcon,
    title: 'Full root access',
    body: "It's your server. SSH in, install anything, configure everything. No abstractions hiding what's running. You get the control of a VPS without the setup tax.",
  },
  {
    Icon: ArchiveIcon,
    title: 'Automatic backups',
    body: 'Weekly snapshots on Pro, daily on Premium — retained for 7 days and restorable in one click. Sleep well knowing your data has a safety net.',
  },
  {
    Icon: CodeIcon,
    title: 'Multi-language',
    body: 'Node.js, Python, Go, and Rust are pre-installed on every server. Any framework that runs on Linux works — Express, Next.js, FastAPI, Gin, and more.',
  },
  {
    Icon: LayersIcon,
    title: 'Multi-site hosting',
    body: 'Run up to 10 sites on one server. Each domain gets its own Nginx config and SSL certificate. One plan, multiple projects.',
  },
];
