import { ZapIcon, GitBranchIcon, ServerIcon, ShieldIcon } from 'lucide-react';

export const featuresData = [
  {
    Icon: ZapIcon,
    title: 'Deploy in minutes',
    body: 'Push your code and your app goes live in seconds. No YAML configs, no ops expertise, no headaches.',
  },
  {
    Icon: GitBranchIcon,
    title: 'GitHub auto-deploy',
    body: 'Connect once. Every push to main triggers a fresh build and deploys your latest code automatically.',
  },
  {
    Icon: ServerIcon,
    title: 'Managed infrastructure',
    body: 'We handle OS updates, patches, and scaling so you can focus entirely on shipping features.',
  },
  {
    Icon: ShieldIcon,
    title: 'Secure by default',
    body: 'HTTPS on every site, isolated containers, and built-in firewall rules — security baked in from day one.',
  },
];
