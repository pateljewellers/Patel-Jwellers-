/**
 * Site modules — routes and nav labels
 * Content for each page will be built in follow-up prompts.
 */
const navigation = [
  { id: 'home', label: 'Home', path: '/', page: 'home' },
  { id: 'about', label: 'About Us', path: '/about', page: 'about' },
  { id: 'collection', label: 'Collection', path: '/collection', page: 'collection' },
  { id: 'shagun', label: 'Shagun Registration', path: '/shagun-registration', page: 'shagun' },
  { id: 'gallery', label: 'Gallery', path: '/gallery', page: 'gallery' },
  { id: 'custom-design', label: 'Custom Design', path: '/custom-design', page: 'custom-design' },
  { id: 'testimonials', label: 'Testimonials', path: '/testimonials', page: 'testimonials' },
  { id: 'blog', label: 'Blog', path: '/blog', page: 'blog' },
  { id: 'contact', label: 'Contact', path: '/contact', page: 'contact' },
];

const pageMeta = {
  home: { title: 'Home', description: 'Patel Jewellers — timeless gold and silver craftsmanship.' },
  about: { title: 'About Us', description: 'Our heritage, craftsmanship, and commitment to excellence.' },
  collection: { title: 'Collection', description: 'Explore our curated jewellery collections.' },
  shagun: { title: 'Shagun Registration', description: 'Register for Shagun and celebrate with Patel Jewellers.' },
  gallery: { title: 'Gallery', description: 'A visual showcase of our finest creations.' },
  'custom-design': { title: 'Custom Design Services', description: 'Bespoke jewellery designed around your vision.' },
  testimonials: { title: 'Testimonials', description: 'Stories from our valued customers.' },
  blog: { title: 'Blog', description: 'News, trends, and insights from Patel Jewellers.' },
  contact: { title: 'Contact', description: 'Visit us or get in touch — we are here to help.' },
  'temple-bangles': { title: 'The Sacred Temple Bangles Immersive Experience', description: 'Explore the divine, fire-forged artistry of our Temple Bangles collection through an interactive portal.' },
};

function getNavItems() {
  return navigation;
}

function getPageMeta(pageId) {
  return pageMeta[pageId] || { title: 'Page', description: '' };
}

module.exports = {
  navigation,
  pageMeta,
  getNavItems,
  getPageMeta,
};
