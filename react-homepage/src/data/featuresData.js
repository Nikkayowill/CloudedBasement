import { GitBranchIcon, LockIcon, DatabaseIcon, GlobeIcon, ArchiveIcon, TerminalIcon, CodeIcon, LayersIcon } from 'lucide-react';

export const featuresData = [
  {
    Icon: GitBranchIcon,
    title: 'GitHub auto-deploys',
    body: 'Connect your repository once and push to deploy automatically. Ideal for teams that want fast, repeatable releases on managed VPS hosting.',
  },
  {
    Icon: DatabaseIcon,
    title: 'One-click databases',
    body: 'Install PostgreSQL or MongoDB from your dashboard with ready-to-use credentials and connection strings. No manual server setup required.',
  },
  {
    Icon: LockIcon,
    title: 'Automatic SSL and domains',
    body: "Point DNS and go live with automatic Let's Encrypt SSL. Host multiple domains on one managed cloud server without certificate busywork.",
  },
  {
    Icon: TerminalIcon,
    title: 'Full root access',
    body: 'Use SSH and root access to install any runtime, package, or service. You keep full VPS control while automation handles routine ops.',
  },
  {
    Icon: ArchiveIcon,
    title: 'Automatic backups',
    body: 'Get scheduled snapshots with one-click restore, so production apps and client websites stay protected when releases go wrong.',
  },
  {
    Icon: CodeIcon,
    title: 'Developer-ready runtimes',
    body: 'Run Node.js, Python, Go, Rust, and popular Linux web frameworks on the same server. Perfect for startup MVPs and growing SaaS apps.',
  },
  {
    Icon: LayersIcon,
    title: 'Multi-site VPS hosting',
    body: 'Host multiple projects, client apps, or WordPress sites on one server with isolated domain routing and automated SSL.',
  },
  {
    Icon: GlobeIcon,
    title: 'No vendor lock-in',
    body: 'Your stack runs on standard Ubuntu infrastructure, so you can migrate anytime without rewriting your app for a proprietary platform.',
  },
];
