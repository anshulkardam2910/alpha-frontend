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

export const AUTH_QUERY_KEYS ={
    currentUser: ['currentUser'],
}

export const IsProduction = process.env.NODE_ENV === 'production';