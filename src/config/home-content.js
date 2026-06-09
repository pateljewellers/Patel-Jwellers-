module.exports = {
  hero: {
    eyebrow: 'Patel Jewellers · Mehsanawala',
    title: 'Where Every Piece Tells a Story',
    tagline: 'Timeless Jewellery, Crafted Forever',
    cta: { label: 'Explore Collection', href: '/collection' },
    slideInterval: 6500,
    slides: [
      {
        image: '/images/hero/slide-01.jpg',
        alt: 'Luxury gold jewellery collection',
        caption: 'Hallmark Gold Collections',
      },
      {
        image: '/images/hero/slide-02.jpg',
        alt: 'Bridal diamond necklace set',
        caption: 'Bridal Masterpieces',
      },
      {
        image: '/images/hero/slide-03.jpg',
        alt: 'Handcrafted diamond rings',
        caption: 'Certified Diamonds',
      },
      {
        image: '/images/hero/slide-04.jpg',
        alt: 'Traditional wedding jewellery',
        caption: 'Heritage Bridal Sets',
      },
      {
        image: '/images/hero/slide-05.jpg',
        alt: 'Designer diamond solitaire ring',
        caption: 'Signature Solitaires',
      },
    ],
  },

  trust: [
    { icon: 'hallmark', label: 'Hallmark Gold', desc: 'BIS certified purity' },
    { icon: 'diamond', label: 'Certified Diamonds', desc: 'IGI & GIA standards' },
    { icon: 'craft', label: 'Master Craftsmen', desc: 'Generations of skill' },
    { icon: 'trust', label: 'Trusted Since Decades', desc: 'Mehsanawala heritage' },
  ],

  collections: [
    { id: 'bridal', title: 'Bridal Masterpieces', image: '/images/collection/necklace-bridal.png', href: '/collection' },
    { id: 'diamonds', title: 'Certified Diamonds', image: '/images/collection/necklace-diamonds.png', href: '/collection' },
    { id: 'gold', title: 'Heritage Antique Gold', image: '/images/collection/necklace-gold.png', href: '/collection' },
  ],

  about: {
    eyebrow: 'About the Brand',
    title: 'Brand Story & Heritage',
    image: '/images/about/heritage.jpg',
    paragraphs: [
      'For generations, Patel Jewellers Mehsanawala has been the trusted name for exquisite gold, diamond, and bridal jewellery in Mehsana and beyond.',
      'Our heritage is rooted in craftsmanship, transparency, and designs that honour tradition while embracing modern elegance. Every creation is shaped with precision, passion, and the warmth of family values.',
      'From bridal trousseaus to heirloom antiques, we invite you to experience jewellery that becomes part of your legacy.',
    ],
    cta: { label: 'Discover Our Story', href: '/about' },
  },

  shagun: {
    eyebrow: 'Shagun Registration',
    title: 'Register Your Bridal Shagun Journey',
    description:
      'Celebrate your wedding with our exclusive Shagun Registration — curated bridal sets, personalised consultations, and special privileges for your big day.',
    cta: { label: 'Register Now', href: '/shagun-registration' },
    cards: [
      { image: '/images/shagun/bridal-gold.jpg', caption: 'Heritage Curation', alt: 'Premium heavy gold bridal necklace set' },
      { image: '/images/shagun/artisan-sketch.jpg', caption: 'Artisan Consultation', alt: 'Artisan designer sketching bespoke bridal jewellery' },
      { image: '/images/shagun/blessing-box.jpg', caption: 'Shagun Blessings', alt: 'Gilded Shagun gold coin blessing keepsake box' }
    ],
    privileges: [
      { num: '01', title: 'Curated Bridal Trousseau', desc: 'VIP access to exclusive handcrafted antique and gold bridal sets.' },
      { num: '02', title: 'Artisan Consultation', desc: 'One-on-one session with our master designers to sketch your bespoke dream pieces.' },
      { num: '03', title: 'Royal Shagun Privileges', desc: 'Special blessings including guaranteed savings and personalized keepsake boxes.' }
    ]
  },

  gallery: {
    eyebrow: 'Signature Creations',
    title: 'Signature Jewellery Gallery',
    subtitle: 'A curated glimpse of our finest handcrafted pieces',
    images: [
      { src: '/images/gallery/gold-choker.jpg', alt: 'Majestic Royal Kundan Gold Choker Set' },
      { src: '/images/gallery/ruby-ring.jpg', alt: 'Cinematic Diamond & Ruby Bridal Ring' },
      { src: '/images/gallery/diamond-earrings.jpg', alt: 'Handcrafted Gold Filigree Diamond Hanging Earrings' },
      { src: '/images/gallery/gold-bangles.jpg', alt: 'Handcrafted Antique Temple Gold Kada Bangles' },
      { src: '/images/gallery/solitaire-ring.jpg', alt: 'Luxury Platinum Diamond Solitaire Ring' },
      { src: '/images/gallery/emerald-pendant.jpg', alt: 'Royal Heritage Emerald & Pearl Necklace Pendant' },
      { src: '/images/gallery/model-01.jpg', alt: 'Exquisite Bridal Gold Necklace Set' }
    ],
    cta: { label: 'View Full Gallery', href: '/gallery' },
  },

  designProcess: {
    eyebrow: 'Bespoke Service',
    title: 'Custom Design Process',
    subtitle: 'Your vision, our master craftsmen — from sketch to sparkle',
    steps: [
      { num: '01', title: 'Consultation', desc: 'Share your vision, occasion, and budget with our design experts.' },
      { num: '02', title: 'Design Sketch', desc: 'Receive detailed sketches and 3D previews tailored to your taste.' },
      { num: '03', title: 'Craftsmanship', desc: 'Our artisans handcraft your piece with certified gold and diamonds.' },
      { num: '04', title: 'Delivery', desc: 'Final inspection, certification, and elegant presentation at handover.' },
    ],
    cta: { label: 'Start Custom Design', href: '/custom-design' },
  },

  testimonials: {
    eyebrow: 'Client Stories',
    title: 'What Our Customers Say',
    items: [
      {
        quote: 'Patel Jewellers made our wedding jewellery absolutely magical. The craftsmanship and service were beyond expectations.',
        name: 'Priya & Rahul Shah',
        role: 'Bridal Collection',
      },
      {
        quote: 'The custom design team brought my mother\'s antique necklace vision to life. True artisans of Mehsana.',
        name: 'Ketan Patel',
        role: 'Custom Design',
      },
      {
        quote: 'Hallmark gold, certified diamonds, and transparent pricing — why our family has trusted them for decades.',
        name: 'Meera Desai',
        role: 'Loyal Customer',
      },
    ],
  },

  showroom: {
    eyebrow: 'Visit Our Sanctuary',
    title: 'Patel Jewellers Mehsanawala',
    image: '/images/about/patel-jewellers-mehsanawala.png',
    features: [
      {
        title: 'Bridal Styling Suites',
        desc: 'Indulge in private consultations within our silk-clad bridal suites.',
        icon: 'crown'
      },
      {
        title: 'Artisanal Consultation',
        desc: 'Co-create customized heritage heirlooms directly with master design consultants.',
        icon: 'gem'
      },
      {
        title: 'Live Purity Display',
        desc: 'Ultimate transparency with 100% certified gold rate screens and karatmeters.',
        icon: 'award'
      },
      {
        title: 'Heritage Gallery',
        desc: 'Explore North Gujarat\'s finest collections of traditional and contemporary ornaments.',
        icon: 'temple'
      }
    ],
    cta: { label: 'Schedule Private Visit', href: '/contact' },
  },

  social: {
    eyebrow: 'Stay Connected',
    title: 'Instagram & Social Gallery',
    handle: '@pateljewellersmehsana',
    images: [
      '/images/social/01.jpg',
      '/images/social/02.jpg',
      '/images/social/03.jpg',
      '/images/social/04.jpg',
      '/images/social/05.jpg',
      '/images/social/06.jpg',
    ],
  },

  contact: {
    eyebrow: 'Get in Touch',
    title: 'Contact Patel Jewellers',
    address: 'Mehsanawala, Mehsana, Gujarat, India',
    phone: '+91 98765 43210',
    email: 'info@pateljewellersmehsana.com',
    hours: 'Mon – Sat: 10:00 AM – 8:00 PM | Sun: 11:00 AM – 2:00 PM',
  },
};
