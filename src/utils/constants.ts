export const product = {
  name: 'Alpha',
  version: '1.0.0',
  description: 'Alpha.ai is a platform for managing your contacts and businesses.',
  links: {
    website: 'https://get-alpha.ai',
    twitter: '',
    linkedin: ' ',
    email: 'support@getalpha.ai',
    phone: '+919999999999',
    address: '123 Main St, Anytown, India',
    city: 'Anytown',
    state: 'DL',
    zip: '12345',
  },
};

export const queryKeys = {
  auth: {
    currentUser: ['currentUser'],
  },
} as const;

// TODO: control later via env.checker with zod

export const IsProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
export const IsPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
export const navItems = [
  {
    label: 'Product',
    href: '/how-it-works',
    dropdown: [
      { title: 'Features', desc: 'Everything you need to build', href: '/how-it-works' },
      {
        title: 'Integrations',
        desc: 'Connect your favorite tools',
        href: '/how-it-works#integrations',
      },
      { title: 'Roadmap', desc: "See what's coming next", href: '/how-it-works#roadmap' },
    ],
  },
  {
    label: 'Resources',
    href: '/about',
    dropdown: [
      { title: 'About', desc: 'Meet the team', href: '/about' },
      { title: 'Security', desc: 'Safe, secure and private', href: '/about#security' },
      { title: 'Docs', desc: 'How to use the platform', href: '/about#docs' },
    ],
  },

  { label: 'Pricing', href: '/pricing', dropdown: null },

  { label: 'Contact', href: '/contact', dropdown: null },
];

export const footerLinks = {
  Product: ['Features', 'Pricing', 'Changelog'],
  Company: ['About', 'Blog'],
  Resources: ['Community', 'Contact', 'Report a vulnerability'],
};

export const linkHrefs: Record<string, string> = {
  Features: '/features',
  Pricing: '/pricing',
  Changelog: '/changelog',
  About: '/about',
  Blog: '/blog',
  Community: '/community',
  Contact: '/contact',
  'Report a vulnerability': '/security',
};
