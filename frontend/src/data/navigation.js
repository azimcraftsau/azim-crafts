export const allProductsTabs = [
  {
    title: 'Handmade Leather Journals',
    filterCategory: 'leather-journals',
    tag: 'leather-journals',
    productIds: ['product-14', 'product-15']
  },
  {
    title: 'Vintage Armour & Suits',
    filterCategory: 'vintage-armour',
    tag: 'vintage-armour',
    productIds: ['product-3', 'product-4', 'product-32', 'product-33', 'product-34', 'product-44', 'product-45', 'product-46', 'product-48', 'product-51', 'product-53', 'product-54', 'product-55', 'product-56', 'product-57', 'product-58', 'product-59', 'product-60', 'product-61', 'product-62', 'product-63']
  },
  {
    title: 'Wooden Shields',
    filterCategory: 'wooden-shields',
    tag: 'wooden-shields',
    productIds: ['product-5', 'product-35', 'product-47', 'product-74', 'product-6', 'product-7', 'product-8', 'product-9', 'product-10', 'product-69']
  },
  {
    title: 'Vintage Wall Lights',
    filterCategory: 'vintage-wall-lights',
    tag: 'vintage-wall-lights',
    productIds: ['product-37', 'product-38', 'product-39', 'product-41', 'product-42', 'product-43', 'product-68', 'product-70', 'product-71']
  },
  {
    title: 'Vintage Chandeliers',
    filterCategory: 'vintage-chandeliers',
    tag: 'vintage-chandeliers',
    productIds: ['product-36', 'product-40', 'product-66', 'product-67', 'product-72', 'product-73']
  },
  {
    title: 'Cinematic Antiques & Lore',
    filterCategory: 'cinematic-antiques',
    tag: 'cinematic-antiques',
    productIds: ['product-1', 'product-2', 'product-65']
  },
  {
    title: 'Fantasy & Gothic Armour Suit',
    filterCategory: 'fantasy-gothic-armour',
    tag: 'fantasy-gothic-armour',
    productIds: ['product-52', 'product-64']
  },
  {
    title: 'Vintage Medieval Helmets',
    filterCategory: 'medieval-helmets',
    tag: 'medieval-helmets',
    productIds: ['product-13', 'product-16', 'product-19', 'product-21', 'product-29']
  },
  {
    title: 'Vintage Diving Helmets',
    filterCategory: 'diving-helmets',
    tag: 'diving-helmets',
    productIds: ['product-20', 'product-23', 'product-24', 'product-26', 'product-30']
  },
  {
    title: 'Vintage Gauntlets',
    filterCategory: 'vintage-gauntlets',
    tag: 'vintage-gauntlets',
    productIds: ['product-11', 'product-49', 'product-50']
  },
  {
    title: 'Vintage Compasses',
    filterCategory: 'vintage-compasses',
    tag: 'vintage-compasses',
    productIds: ['product-25', 'product-27', 'product-28', 'product-31']
  },
  {
    title: 'Vintage Table & Wall Clocks',
    filterCategory: 'table-clocks',
    tag: 'table-clocks',
    productIds: ['product-12', 'product-17']
  },
  {
    title: 'Walking Sticks & Brolly Stand',
    filterCategory: 'walking-sticks',
    tag: 'walking-sticks',
    productIds: ['product-18', 'product-22']
  }
];

export const mainNavLinks = [
  { title: 'All Products', href: '#categories-section' },
  { title: 'Armour & Suits', href: '#categories-section' },
  { title: 'Lighting', href: '#categories-section' },
  { title: 'Shields', href: '#categories-section' },
  { title: 'About Us', href: '#about-section' }
];

export const footerQuickLinks = [
  { title: 'About Us', href: '#about-section' },
  { title: 'All Products', href: '#categories-section', catKey: 'all' },
  { title: 'Vintage Armour & Suits', href: '#vintage-armour', catKey: 'vintage-armour' },
  { title: 'Wooden Shields', href: '#wooden-shields', catKey: 'wooden-shields' },
  { title: 'Vintage Chandeliers', href: '#vintage-chandeliers', catKey: 'vintage-chandeliers' },
  { title: 'Vintage Wall Lights', href: '#vintage-wall-lights', catKey: 'vintage-wall-lights' },
  { title: 'Cinematic Antiques & Lore', href: '#cinematic-antiques', catKey: 'cinematic-antiques' },
  { title: 'Fantasy & Gothic Armour Suit', href: '#fantasy-gothic-armour', catKey: 'fantasy-gothic-armour' },
  { title: 'Vintage Medieval Helmets', href: '#medieval-helmets', catKey: 'medieval-helmets' },
  { title: 'Vintage Gauntlets', href: '#vintage-gauntlets', catKey: 'vintage-gauntlets' },
  { title: 'Vintage Diving Helmets', href: '#vintage-diving-helmets', catKey: 'diving-helmets' },
  { title: 'Vintage Compasses', href: '#vintage-compasses', catKey: 'vintage-compasses' },
  { title: 'Handmade Leather Journals', href: '#leather-journals', catKey: 'leather-journals' },
  { title: 'Our Heritage & Story', href: '#about-section' }
];

export const shopByMenu = [
  {
    title: 'Armour & Suits',
    href: '#all-products?cat=vintage-armour',
    items: [
      { title: 'Vintage Armour & Suits', href: '#all-products?cat=vintage-armour' },
      { title: 'Fantasy & Gothic Armour', href: '#all-products?cat=fantasy-gothic-armour' },
      { title: 'Vintage Medieval Helmets', href: '#all-products?cat=medieval-helmets' },
      { title: 'Vintage Gauntlets', href: '#all-products?cat=vintage-gauntlets' }
    ]
  },
  {
    title: 'Shields & Lore',
    href: '#all-products?cat=wooden-shields',
    items: [
      { title: 'Handmade Wooden Shields', href: '#all-products?cat=wooden-shields' },
      { title: 'Cinematic Antiques & Lore', href: '#all-products?cat=cinematic-antiques' },
      { title: 'Captain America & Thor', href: '#all-products?cat=cinematic-antiques' }
    ]
  },
  {
    title: 'Lighting & Decor',
    href: '#all-products?cat=vintage-chandeliers',
    items: [
      { title: 'Vintage Chandeliers', href: '#all-products?cat=vintage-chandeliers' },
      { title: 'Vintage Wall Lights', href: '#all-products?cat=vintage-wall-lights' },
      { title: 'Wrought Iron Fixtures', href: '#all-products?cat=vintage-wall-lights' }
    ]
  },
  {
    title: 'Maritime Antiques',
    href: '#all-products?cat=diving-helmets',
    items: [
      { title: 'Vintage Diving Helmets', href: '#all-products?cat=diving-helmets' },
      { title: 'Vintage Compasses', href: '#all-products?cat=vintage-compasses' },
      { title: 'Nautical Sextants', href: '#all-products?cat=vintage-compasses' }
    ]
  },
  {
    title: 'Leather & Crafts',
    href: '#all-products?cat=leather-journals',
    items: [
      { title: 'Handmade Leather Journals', href: '#all-products?cat=leather-journals' },
      { title: 'Embossed Grimoires', href: '#all-products?cat=leather-journals' },
      { title: 'Vintage Table & Wall Clocks', href: '#all-products?cat=table-clocks' },
      { title: 'Walking Sticks & Stands', href: '#all-products?cat=walking-sticks' }
    ]
  }
];
