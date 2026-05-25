const categories = [
  {
    id: 'bridal',
    title: 'Bridal Jewellery',
    heroImage: '/images/gallery/model-01.jpg',
    intro: {
      eyebrow: 'Bridal Collection',
      title: 'Exquisite Bridal Sets for Your Most Cherished Moments',
      paragraphs: [
        'Created for weddings, the bridal collection blends traditional gold craftsmanship with modern silhouettes for a refined yet timeless finish.',
        'Every set is designed to feel luxurious, comfortable, and worthy of family heirlooms, with delicate stones, flawless polish, and meaningful details.',
      ],
      cta: { label: 'View Bridal Styles', href: '/collection?category=bridal' },
    },
    gallery: [
      { src: '/images/gallery/model-01.jpg', alt: 'Bridal necklace with layered pearls' },
      { src: '/images/gallery/model-02.jpg', alt: 'Elegant bride wearing diamond choker' },
      { src: '/images/gallery/model-03.jpg', alt: 'Statement bridal earrings and bangles' },
      { src: '/images/gallery/model-04.jpg', alt: 'Bridal gold necklace set in modern design' },
    ],
    featuredDesigns: [
      {
        title: 'Heritage Polki Harmony',
        text: 'A captivating blend of polki, kundan and soft pastels to celebrate modern brides.',
        image: '/images/gallery/model-05.jpg',
        alt: 'Polki bridal jewellery design',
      },
      {
        title: 'Rose Gold Bridal Luxe',
        text: 'Warm rose gold accents paired with premium diamonds for luminous wedding moments.',
        image: '/images/gallery/model-06.jpg',
        alt: 'Rose gold bridal jewellery look',
      },
    ],
    material: {
      eyebrow: 'Materials & Craft',
      title: 'Premium Gold, Diamonds and Finishing',
      details: [
        { title: 'Purity Assured', text: 'BIS hallmark gold and certified diamond clarity with every bridal creation.' },
        { title: 'Handcrafted Detail', text: 'Seamless setting, polishing and finishing by our master artisans.' },
        { title: 'Comfort & Balance', text: 'Refined silhouettes that feel beautiful on the wedding day and beyond.' },
      ],
      image: '/images/gallery/model-07.jpg',
    },
    inquiry: {
      title: 'Ready to inquire about bridal jewellery?',
      text: 'Our bridal specialists can help you choose the perfect set, create a custom ensemble, or reserve your favourite design for an upcoming wedding.',
      cta: { label: 'Book Bridal Consultation', href: '/contact' },
    },
  },
  {
    id: 'diamonds',
    title: 'Diamond Jewellery',
    heroImage: '/images/gallery/model-10.jpg',
    intro: {
      eyebrow: 'Diamond Collection',
      title: 'Statement Diamond Pieces for Elegant Style',
      paragraphs: [
        'Discover diamond jewellery with bright sparkle, modern proportions, and heirloom-worthy craftsmanship.',
        'From solitaire rings to refined necklaces, each piece is designed to highlight premium clarity and polished brilliance.',
      ],
      cta: { label: 'View Diamond Pieces', href: '/collection?category=diamonds' },
    },
    gallery: [
      { src: '/images/gallery/model-10.jpg', alt: 'Model wearing diamond stud earrings' },
      { src: '/images/gallery/model-11.jpg', alt: 'Diamond solitaire ring close-up' },
      { src: '/images/gallery/model-12.jpg', alt: 'Diamond pendant with gloss finish' },
      { src: '/images/gallery/model-13.jpg', alt: 'Diamond bracelet with clean lines' },
    ],
    featuredDesigns: [
      {
        title: 'Solitaire Radiance',
        text: 'A pure diamond solitaire brought to life by expert cutting and classic proportions.',
        image: '/images/gallery/model-14.jpg',
        alt: 'Solitaire diamond ring design',
      },
      {
        title: 'Luminous Layered Necklace',
        text: 'Delicate draped chains with sparkling diamond accents for evening elegance.',
        image: '/images/gallery/model-15.jpg',
        alt: 'Diamond layered necklace',
      },
    ],
    material: {
      eyebrow: 'Materials & Craft',
      title: 'Selected Diamonds and Precision Setting',
      details: [
        { title: 'Certified Quality', text: 'IGI-level grading for cut, color, clarity and carat in every diamond.' },
        { title: 'Secure Setting', text: 'Expert setting techniques keep each stone secure, bright and comfortable.' },
        { title: 'Polished Brilliance', text: 'Mirrored finishing enhances sparkle across every surface and edge.' },
      ],
      image: '/images/gallery/model-16.jpg',
    },
    inquiry: {
      title: 'Explore diamond jewellery with our team',
      text: 'We can guide you through diamond selections, custom upgrades, and the ideal piece for your signature style.',
      cta: { label: 'Ask About Diamonds', href: '/contact' },
    },
  },
  {
    id: 'gold',
    title: 'Gold Jewellery',
    heroImage: '/images/gallery/model-08.jpg',
    intro: {
      eyebrow: 'Gold Collection',
      title: 'Timeless Gold Designs with Modern Charm',
      paragraphs: [
        'Celebrate heritage with our gold collection, crafted from polished 22K and 18K alloys designed for lasting grace.',
        'Each design bridges the warmth of classic gold with refined texture, statement volume, and wearable luxury.',
      ],
      cta: { label: 'View Gold Collection', href: '/collection?category=gold' },
    },
    gallery: [
      { src: '/images/gallery/model-05.jpg', alt: 'Gold necklace with modern motifs' },
      { src: '/images/gallery/model-06.jpg', alt: 'Model wearing gold layered chains' },
      { src: '/images/gallery/model-07.jpg', alt: 'Gold hoop earrings close-up' },
      { src: '/images/gallery/model-08.jpg', alt: 'Gold cocktail ring and bracelet' },
    ],
    featuredDesigns: [
      {
        title: 'Contemporary Gold Statement',
        text: 'Bold geometric forms enliven rich gold with a fashion-forward edge.',
        image: '/images/gallery/model-02.jpg',
        alt: 'Contemporary gold jewellery',
      },
      {
        title: 'Classic Gold Heritage Set',
        text: 'A refined, traditional pattern reimagined for modern celebrations.',
        image: '/images/gallery/model-03.jpg',
        alt: 'Traditional gold jewellery set',
      },
    ],
    material: {
      eyebrow: 'Materials & Craft',
      title: 'Gold Heritage That Feels Modern',
      details: [
        { title: 'Premium Alloys', text: 'Carefully selected 22K and 18K gold blends for shine, strength and luxury.' },
        { title: 'Detailed Texture', text: 'Hand-finished surfaces and sculpted metalwork enhance every piece.' },
        { title: 'Statement Wearability', text: 'Balanced proportions designed for everyday grace and festive style.' },
      ],
      image: '/images/gallery/model-04.jpg',
    },
    inquiry: {
      title: 'Discuss your gold jewellery preferences',
      text: 'From heritage designs to contemporary gold accents, our consultants help you discover the perfect piece.',
      cta: { label: 'Contact Gold Experts', href: '/contact' },
    },
  },
  {
    id: 'antique',
    title: 'Antique Jewellery',
    heroImage: '/images/gallery/model-12.jpg',
    intro: {
      eyebrow: 'Antique Collection',
      title: 'Timeless Antique Jewellery with Elegant History',
      paragraphs: [
        'Rich textures, vintage-inspired motifs and antique finishing give this collection an heirloom feel for special occasions.',
        'Each piece is curated to feel both luxurious and resonant, with workmanship that reflects classic jewellery tradition.',
      ],
      cta: { label: 'View Antique Pieces', href: '/collection?category=antique' },
    },
    gallery: [
      { src: '/images/gallery/model-12.jpg', alt: 'Antique-style gold choker on model' },
      { src: '/images/gallery/model-14.jpg', alt: 'Vintage diamond pendant detail' },
      { src: '/images/gallery/model-17.jpg', alt: 'Antique ring with filigree detail' },
      { src: '/images/gallery/model-18.jpg', alt: 'Antique-inspired layered necklace' },
    ],
    featuredDesigns: [
      {
        title: 'Vintage Filigree Set',
        text: 'Expertly crafted antique-inspired designs with rich detailing and cultural elegance.',
        image: '/images/gallery/model-09.jpg',
        alt: 'Antique filigree jewellery',
      },
      {
        title: 'Elegant Heritage Necklace',
        text: 'A dramatic, museum-style necklace with old-world charm and luxury polish.',
        image: '/images/gallery/model-11.jpg',
        alt: 'Heritage antique necklace',
      },
    ],
    material: {
      eyebrow: 'Materials & Craft',
      title: 'Antique Finishes and Masterful Detailing',
      details: [
        { title: 'Artisan Finishing', text: 'Textured surfaces and antique patina for authentic heritage style.' },
        { title: 'Stone Setting', text: 'Precise placement of stones to enhance vintage flair and sparkle.' },
        { title: 'Balanced Weight', text: 'Pieces designed to feel luxurious without compromising comfort.' },
      ],
      image: '/images/gallery/model-12.jpg',
    },
    inquiry: {
      title: 'Interested in antique-inspired jewellery?',
      text: 'Our specialists can help you select jewellery with the perfect blend of heritage, detail, and wearable luxury.',
      cta: { label: 'Reserve Antique Preview', href: '/contact' },
    },
  },
];

module.exports = {
  defaultCategory: 'bridal',
  hero: {
    eyebrow: 'Collections',
    title: 'Luxury Jewellery Collections',
    description: 'Discover beautifully styled bridal, diamond, gold and antique jewellery made for celebration, gifting and personal luxury.',
    features: [
      'Thoughtfully curated category journeys',
      'Model-worn jewellery with premium styling',
      'Direct access to bespoke design consultation',
    ],
    cta: { label: 'Explore the Range', href: '/collection?category=bridal' },
    image: '/images/gallery/model-16.jpg',
  },
  filters: [
    { id: 'bridal', label: 'Bridal' },
    { id: 'diamonds', label: 'Diamonds' },
    { id: 'gold', label: 'Gold' },
    { id: 'antique', label: 'Antique' },
  ],
  collectionGrid: [
    { id: 'bridal', title: 'Bridal Heritage', subtitle: 'Elegant wedding jewellery with luminous craftsmanship.', image: '/images/gallery/model-11.jpg', href: '/collection?category=bridal' },
    { id: 'diamonds', title: 'Diamond Statements', subtitle: 'Sparkling pieces designed for premiere occasions.', image: '/images/gallery/model-12.jpg', href: '/collection?category=diamonds' },
    { id: 'gold', title: 'Gold Icons', subtitle: 'Bold gold designs with polished luxury.', image: '/images/gallery/model-14.jpg', href: '/collection?category=gold' },
    { id: 'antique', title: 'Antique Elegance', subtitle: 'Vintage-inspired jewellery with heirloom beauty.', image: '/images/gallery/model-17.jpg', href: '/collection?category=antique' },
  ],
  luxuryCard: {
    eyebrow: 'Luxury Studio',
    title: 'Premium Jewellery Crafted for Modern Luxury',
    description: 'Our luxury range brings premium design, exquisite materials and careful finishing together in a refined collection. Experience statement jewellery that feels both prestigious and wearable.',
    image: '/images/gallery/model-10.jpg',
    cta: { label: 'Request Private Preview', href: '/contact' },
  },
  featuredCollections: [
    { title: 'Signature Bridal Sets', text: 'Timeless ceremonial jewellery designed for unforgettable moments.', image: '/images/gallery/model-03.jpg', href: '/collection?category=bridal' },
    { title: 'Diamond Elegance', text: 'Refined diamond jewellery with premium brilliance and modern style.', image: '/images/gallery/model-08.jpg', href: '/collection?category=diamonds' },
    { title: 'Antique Luxe', text: 'Vintage-inspired masterpieces that echo heritage and high fashion.', image: '/images/gallery/model-12.jpg', href: '/collection?category=antique' },
  ],
  customDesignCTA: {
    eyebrow: 'Custom Design',
    title: 'Handcrafted Designs Tailored to You',
    description: 'Create a bespoke collection piece with our design team — from concept to crafted luxury.',
    cta: { label: 'Book a Design Consultation', href: '/custom-design' },
  },
  categories,
};
