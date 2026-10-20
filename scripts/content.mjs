export const contacts = {
  fashion: { label: 'LoLo Fashion House', phone: '0713280731', wa: '254713280731' },
  bridal: { label: 'LoLo Bridal', phone: '0740537139', wa: '254740537139', email: 'lolobridal001@gmail.com' },
};

// Add a per-product Selar `url` to digitalProducts entries when available; otherwise the store link is used.
export const selarStoreUrl = 'https://selar.com/m/laurine-muturi1';

export const waLink = (brand, text) =>
  `https://wa.me/${contacts[brand].wa}?text=${encodeURIComponent(text)}`;

export const tagline = 'Style your moments. Celebrate your story.';

export const brands = [
  {
    id: 'fashion',
    href: '/#collections',
    name: 'LoLo Fashion House',
    img: '01',
    kicker: 'Custom occasion wear',
    copy:
      'Outfits designed around your occasion, measurements, and personal style. From elegant traditional wedding gowns and red-carpet looks to birthday and graduation outfits, every piece is made to feel uniquely yours.',
  },
  {
    id: 'mfalme',
    href: '/mfalme.html',
    name: 'Mfalme by LoLo',
    img: '33',
    kicker: 'Menswear',
    copy:
      'Style, confidence, and distinction, tailored for the modern gentleman. Custom-made suits and African traditional outfits that combine refined tailoring with individual expression, for weddings, formal occasions and cultural celebrations.',
  },
  {
    id: 'kids',
    href: '/kids.html',
    name: 'LoLo Kids',
    img: 'kids',
    kicker: 'Girls’ occasion wear',
    copy:
      'Beautiful outfits for little girls and the special moments that make childhood memorable, from birthdays and family occasions to weddings, with playful charm, thoughtful design and beautiful finishing.',
  },
  {
    id: 'bridal',
    href: '/bridal.html',
    name: 'LoLo Bridal',
    img: '15',
    kicker: 'Weddings & events',
    copy:
      'Bridal products, hands-on wedding support, and digital planning resources: everything to prepare for your big day with confidence and peace of mind.',
  },
];

export const bridalOfferings = [
  {
    title: 'Custom-Made Wedding Gowns',
    img: '37',
    copy:
      'Personalised bridal gowns that reflect your style, silhouette and wedding vision, with careful attention to fit, detail and finishing. From timeless elegance to contemporary statement designs.',
  },
  {
    title: 'Personalised Wedding Accessories',
    img: '35',
    copy:
      'Customised champagne and wine glasses, ring holders, wedding veils and other bridal keepsakes that add a special touch to your day and beyond.',
  },
  {
    title: 'Bridal Robes & Getting-Ready Essentials',
    img: '42',
    copy:
      'Bridal robes and complementary essentials for beautiful photographs, comfortable preparations and memorable bridal-party experiences.',
  },
  {
    title: 'Bridal Assistant Services',
    img: '32',
    copy:
      'Personalised support with fittings, styling, follow-up on important details and wedding-day needs, so you can enjoy the experience while the details receive thoughtful attention.',
  },
  {
    title: 'Wedding Planning & Coordination',
    img: '34',
    copy:
      'From bringing your ideas together to helping the day run smoothly. We organise the details and coordinate the moving parts towards a celebration that reflects your vision.',
  },
];

export const beforeIDo = {
  intro:
    'Set the tone for your wedding day with a beautifully styled bridal morning: a special space to get ready, take photographs and celebrate with your bridal party before walking down the aisle.',
  note: 'Prices are exclusive of transport and delivery.',
  packages: [
    {
      name: 'Before the “I Do”',
      price: 'KSh 21,000',
      items: [
        ['Bridal Balloon Moment', 'KSh 9,000'],
        ['Personalised Bridal Ring Mirror', 'KSh 4,500'],
        ['Personalised Champagne Glasses (pair)', 'KSh 3,000'],
        ['Personalised Champagne Bottle', 'KSh 1,500'],
        ['Personalised Bridal & Groom Hangers', 'KSh 3,000'],
      ],
    },
    {
      name: 'Moments Before I Do',
      price: 'KSh 27,000',
      items: [['Lux Room décor, including bridesmaids’ props and sunglasses', 'KSh 15,000']],
    },
    {
      name: 'Premium Package',
      price: 'Enquire',
      items: [['Includes sunglasses for the bride & groom', '']],
    },
  ],
  addons: [
    ['“Cheers to I Do” set: personalised champagne glasses + personalised champagne', 'KSh 5,000'],
    ['Each extra personalised glass', 'KSh 1,500'],
    ['Ring mirror set', 'KSh 4,500'],
    ['Personalised hangers: Bride & Groom', 'KSh 3,000'],
    ['Personalised hangers: Bridesmaids', 'KSh 1,500'],
    ['Sunglasses', 'On request'],
  ],
};

export const guardianAngel = {
  intro:
    'Over six years of wedding-planning experience and a decade in fashion design, brought together to protect your bridal experience. You deserve to be the bride, not the person solving problems on your wedding day.',
  tiers: [
    {
      name: 'The Peaceful Morning',
      price: 'KSh 35,000',
      points: ['2 assistants, up to 6 hours', 'Written Peace Schedule', 'Dressing help for bride + up to 4 bridesmaids', 'Minor wardrobe mishap support'],
    },
    {
      name: 'The Bridal Guardian Angel',
      price: 'KSh 65,000',
      points: ['2 assistants, up to 10 hours', 'Design Alignment session & Look Board', 'One fitting appointment', 'Ceremony & photo-session support, 1 outfit change'],
    },
    {
      name: 'The Executive Peace Experience',
      price: 'KSh 95,000',
      points: ['3-person team, up to 14 hours', 'Full Design Alignment & Look Board', 'Up to 2 fittings, up to 8 bridesmaids', 'Up to 3 outfit changes & groom attire check'],
    },
  ],
  extra: 'Also available on its own: The Bridal Vision Session, KSh 15,000, fully redeemable toward any package.',
  note: 'Coverage is limited to the agreed hours and programme. Travel outside Nairobi is quoted separately.',
};

export const planning = {
  intro:
    'Three levels of support for a calmer, more coordinated celebration. Detailed service packages and deliverables are available on request.',
  tiers: [
    { name: 'The Wedding Day Peace', price: 'From KSh 50,000', detail: 'Coordination beginning two weeks before the wedding.' },
    { name: 'The Guided Celebration', price: 'From KSh 90,000', detail: 'Structure, deadlines and oversight from one month before.' },
    { name: 'The Full Peace Experience', price: 'From KSh 250,000', detail: 'A planning partner from early vision and budgeting to celebration.' },
  ],
  note: 'Weddings above 300 guests, multi-event celebrations, or those held away from Nairobi are quoted individually.',
};

export const digitalProducts = [
  {
    name: 'The Bridal Roadmap',
    img: 'planner',
    copy:
      'For the bride who needs clarity on where to begin. Understand the wedding planning journey, identify your priorities, and map out the next steps towards your big day.',
  },
  {
    name: 'The Vendor Matchbook',
    img: 'planner',
    copy:
      'Approach vendor selection more intentionally: organise your options, ask the right questions, and keep important vendor information together as you decide.',
  },
  {
    name: 'The Bridal Party Playbook',
    img: 'planner',
    copy:
      'Clarify roles, expectations, budgets, preparations and wedding-day responsibilities so everyone understands how to contribute, and protect the joy of your experience.',
  },
  {
    name: 'The Wedding Masterplanner',
    img: 'planner',
    copy:
      'Your comprehensive companion from beginning to end. Manage timelines, budgets, vendors, tasks and essential details in one organised system.',
  },
];

export const about = {
  paragraphs: [
    'LoLo Fashion House was born from a journey of creativity, self-discovery, and a passion for fashion. Since 2017, what began as a small venture has grown into a fashion brand dedicated to creating meaningful, beautifully crafted pieces for life’s special moments.',
    'Our work is rooted in the belief that clothing is more than what we wear. It is an expression of identity, confidence, culture, and personal style.',
    'Through LoLo Fashion House, we create custom-made outfits for a variety of occasions. Through Mfalme, we celebrate the modern gentleman and African-inspired menswear. Through LoLo Kids, we bring thoughtful designs to little girls. And through LoLo Bridal, we extend our creativity beyond the gown to the accessories, preparations, planning tools, and experiences that make weddings special.',
    'Our vision is to build a connected fashion and bridal experience where creativity meets craftsmanship, and every client can find something that reflects their story.',
  ],
  promise: 'Thoughtful design. Personal expression. Beautifully made moments.',
};

export const bridalEnquiryTypes = [
  'Before I Do Experience',
  'Bridal Assistant Services',
  'Wedding Planning & Coordination',
];

export const buildEnquiryMessage = (b) =>
  [
    `Hello, I would like to make an enquiry.`,
    `Name: ${b.name}`,
    `Phone: ${b.phone}`,
    b.email && `Email: ${b.email}`,
    `Enquiry type: ${b.eventType}`,
    b.eventDate && `Event date: ${b.eventDate}`,
    b.location && `Location: ${b.location}`,
    b.note && `Notes: ${b.note}`,
  ]
    .filter(Boolean)
    .join('\n');

export const collections = [
  { name: 'Wedding Gowns', note: 'Statement bridal silhouettes, made to measure.', img: '21' },
  { name: 'Ruracio & Traditional Wear', note: 'Ceremony sets with presence for dowry and family ceremonies.', img: '24' },
  { name: 'Red-Carpet Looks', note: 'Statement gowns and evening wear for galas and award events.', img: '18' },
  { name: 'Birthday & Graduation Outfits', note: 'Celebration looks designed around you.', img: '13' },
  { name: 'Ankara & Kitenge', note: 'Bold prints turned into elegant tailoring.', img: '20' },
];


export const enquiryOptions = [
  'Wedding Gown',
  'Ruracio / Traditional Wear',
  'Ankara / Kitenge',
  'Red-Carpet / Birthday / Graduation Outfit',
  'Mfalme Menswear',
  'LoLo Kids Outfit',
  'Bridesmaid Dresses',
  'Before I Do Experience',
  'Bridal Assistant Services',
  'Wedding Planning & Coordination',
  'Other',
];

export const mfalme = {
  intro:
    'Style, confidence, and distinction, tailored for the modern gentleman. Custom-made suits and African traditional outfits that combine refined tailoring with individual expression.',
  offerings: [
    { name: 'Custom suits', note: 'Tailored to your measurements for weddings, formal occasions and everyday distinction.', img: '05' },
    { name: 'African traditional wear', note: 'Ruracio and cultural-ceremony outfits with refined detail and bold character.', img: '23' },
    { name: 'Groom & groomsmen styling', note: 'Coordinated looks that sit beautifully alongside the bride’s gown.', img: '06' },
  ],
  photos: ['12', '39', '04', '44'],
};

export const kidsInfo = {
  intro:
    'Beautiful outfits for little girls and the special moments that make childhood memorable, with playful charm, thoughtful design and beautiful finishing.',
  occasions: [
    ['Birthdays', 'Party dresses made to twirl in.'],
    ['Weddings & flower girls', 'Matching the bridal party, comfortable all day.'],
    ['Family occasions', 'Church, holidays and photoshoots.'],
  ],
};
