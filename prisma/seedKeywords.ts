import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Manus AI Keyword Research Dataset
const MANUS_DATASET = {
  ProductKeywords: {
    Jewelry: [
      'sterling silver necklace', 'birthstone necklace', 'layered bracelet', 'gold filled necklace',
      'minimalist ring', 'statement earrings', 'personalized name necklace', 'initial necklace',
      'charm bracelet', 'beaded bracelet', 'crystal necklace', 'pearl earrings', 'hoop earrings',
      'stud earrings', 'dangle earrings', 'engagement ring', 'wedding band', 'promise ring',
      'signet ring', 'stacking rings', 'friendship bracelet', 'anklet', 'body jewelry',
      'nose ring', 'ear cuff', 'locket necklace', 'pendant necklace', 'choker necklace',
      'gemstone ring', 'diamond earrings'
    ],
    WallArt: [
      'minimalist print', 'boho wall decor', 'abstract wall art', 'landscape painting',
      'botanical print', 'nursery wall art', 'custom portrait', 'pet portrait', 'city map print',
      'star map', 'motivational quote print', 'scripture wall art', 'watercolor art',
      'line art print', 'gallery wall set', 'large wall art', 'framed wall art', 'canvas print',
      'wood wall art', 'metal wall art', 'macrame wall hanging', 'wall tapestry', 'shelf decor',
      '3d wall art', 'digital download print'
    ],
    Weddings: [
      'bridal hair accessory', 'custom wedding sign', 'wedding invitation suite', 'save the date card',
      'bridesmaid proposal box', 'groomsmen gift', 'wedding guest book', 'wedding favors',
      'cake topper', 'ring bearer pillow', 'flower girl dress', 'wedding dress', 'veil',
      'bridal shower invitation', 'bachelorette party shirts', 'table numbers', 'place cards',
      'seating chart', 'wedding welcome sign', 'unity candle set', 'personalized champagne flutes',
      'wedding planner book', 'honeymoon fund jar', 'just married banner', 'thank you cards'
    ],
    Clothing: [
      'graphic t shirt', 'embroidered sweatshirt', 'custom hoodie', 'band t-shirt',
      'vintage sweatshirt', 'funny shirt', 'matching family shirts', 'baby onesie',
      'toddler shirt', 'birthday shirt', 'maternity shirt', 'crop top', 'tank top',
      'long sleeve shirt', 'polo shirt', 'denim jacket', 'bomber jacket', 'leggings',
      'joggers', 'shorts', 'skirt', 'dress', 'pajamas', 'socks', 'hat'
    ],
    DigitalDownloads: [
      'printable wall art', 'planner template', 'svg file', 'procreate brushes',
      'lightroom presets', 'digital sticker', 'notion template', 'resume template',
      'ebook template', 'social media templates', 'canva templates', 'wedding invitation template',
      'baby shower invitation template', 'birthday invitation template', 'digital paper pack',
      'clipart bundle', 'font bundle', 'mockups', 'digital journal', 'habit tracker printable',
      'budget planner printable', 'meal planner printable', 'fitness planner printable',
      'business card template', 'logo design template'
    ],
    Gifts: [
      'personalized tumbler', 'engraved cutting board', 'custom coffee mug', 'photo gift',
      'star map gift', 'personalized puzzle', 'custom doormat', 'engraved watch box',
      'personalized wallet', 'custom keychain', 'monogrammed tote bag', 'personalized blanket',
      'custom pet bowl', 'engraved flask', 'personalized beer glass', 'custom wine glass',
      'personalized apron', 'custom phone case', 'personalized book', 'custom candle',
      'gift for her', 'gift for him', 'gift for mom', 'gift for dad', 'best friend gift'
    ],
    HomeDecor: [
      'decorative pillow', 'throw blanket', 'area rug', 'curtains', 'candle holder',
      'vase', 'planter', 'wall clock', 'mirror', 'shelf', 'coaster set', 'doormat',
      'wreath', 'centerpiece', 'table runner', 'placemats', 'cloth napkins', 'kitchen towel',
      'soap dispenser', 'jewelry box', 'trinket dish', 'bookends', 'storage basket',
      'lamp', 'night light'
    ],
    CraftSupplies: [
      'yarn', 'fabric', 'beads', 'charms', 'jewelry making kit', 'sticker sheet',
      'washi tape', 'scrapbook paper', 'rubber stamp', 'ink pad', 'paint brushes',
      'acrylic paint', 'watercolor paint', 'canvas', 'embroidery kit', 'cross stitch pattern',
      'crochet pattern', 'knitting needles', 'polymer clay', 'resin molds', 'candle making kit',
      'soap making supplies', 'leather scraps', 'wood slices', 'laser cut wood shapes'
    ],
    Pet: [
      'dog bandana', 'cat collar', 'pet id tag', 'dog bed', 'cat tree', 'pet portrait',
      'dog bowl', 'cat toy', 'dog leash', 'dog harness', 'pet sympathy gift', 'dog mom shirt',
      'cat dad mug', 'pet memorial stone', 'custom pet socks', 'dog treat jar', 'catnip toys',
      'pet carrier', 'dog poop bag holder', 'pet grooming supplies', 'dog birthday cake',
      'cat grass planter', 'reptile hide', 'bird feeder', 'fish tank decor'
    ],
    BabyKids: [
      'baby milestone blanket', 'nursery name sign', 'baby shower gift', 'personalized baby book',
      'wooden name puzzle', 'kids activity table', 'montessori toys', 'sensory bin',
      'busy board', 'kids growth chart', 'personalized piggy bank', 'baby mobile',
      'crib sheet', 'swaddle blanket', 'baby hat', 'toddler backpack', 'kids water bottle',
      'lunch box', 'art smock', 'kids play tent', 'dollhouse', 'wooden blocks',
      'kids table and chairs', 'toy storage', 'first birthday outfit'
    ],
    Accessories: [
      'tote bag', 'crossbody bag', 'backpack', 'wallet', 'phone case', 'keychain',
      'enamel pin', 'iron on patch', 'hair scarf', 'scrunchie', 'headband', 'claw clip',
      'sunglasses', 'belt', 'scarf', 'gloves', 'beanie', 'baseball cap', 'bucket hat',
      'socks', 'slippers', 'umbrella', 'passport holder', 'luggage tag', 'laptop sleeve'
    ]
  },
  
  Materials: [
    'sterling silver', 'gold filled', 'solid gold', 'stainless steel', 'resin', 'polymer clay',
    'bamboo wood', 'walnut wood', 'maple wood', 'linen fabric', 'cotton', 'fleece', 'leather',
    'faux leather', 'glass', 'ceramic', 'stoneware', 'concrete', 'acrylic', 'wool', 'felt',
    'brass', 'copper', 'titanium', 'platinum', 'rose gold', 'white gold', 'pewter', 'aluminum',
    'bronze', 'canvas', 'denim', 'flannel', 'lace', 'satin', 'silk', 'velvet', 'chiffon',
    'organza', 'tulle', 'cork', 'paper', 'cardstock', 'vinyl', 'rubber', 'silicone',
    'birch wood', 'cherry wood', 'oak wood', 'pine wood', 'cedar wood', 'plywood', 'mdf',
    'seagrass', 'rattan', 'wicker', 'jute', 'hemp', 'down', 'feather', 'microsuede',
    'sherpa', 'terry cloth', 'muslin', 'gauze', 'tweed', 'herringbone', 'houndstooth',
    'gingham', 'plaid', 'buffalo plaid', 'argyle', 'paisley', 'damask', 'brocade',
    'jacquard', 'poplin', 'chambray', 'corduroy', 'seersucker', 'spandex', 'nylon',
    'polyester', 'rayon', 'viscose', 'modal', 'lyocell', 'tencel', 'acetate', 'angora',
    'cashmere', 'mohair', 'alpaca', 'merino wool', 'shetland wool', 'lambswool', 'tweed wool',
    'harris tweed', 'boiled wool', 'porcelain', 'earthenware', 'terracotta', 'bone china',
    'borosilicate glass', 'fused glass', 'stained glass', 'sea glass', 'crystal', 'quartz',
    'amethyst', 'rose quartz', 'turquoise', 'moonstone', 'labradorite', 'opal', 'pearl',
    'diamond', 'moissanite', 'sapphire', 'ruby', 'emerald', 'garnet', 'peridot', 'topaz',
    'aquamarine', 'onyx', 'agate', 'jasper', 'malachite', 'lapis lazuli', 'sunstone',
    'tiger eye', 'hematite', 'obsidian', 'lava rock', 'shell', 'mother of pearl', 'coral',
    'amber', 'jet', 'bone', 'horn', 'seed beads', 'delica beads', 'miyuki beads',
    'swarovski crystals', 'czech glass beads', 'freshwater pearl', 'tahitian pearl', 'south sea pearl'
  ],
  
  Styles: [
    'minimalist', 'boho', 'farmhouse', 'cottagecore', 'rustic', 'vintage', 'retro', 'gothic',
    'kawaii', 'scandinavian', 'industrial', 'modern', 'art deco', 'shabby chic', 'coastal',
    'nautical', 'preppy', 'mid-century modern', 'eclectic', 'traditional', 'transitional',
    'contemporary', 'glam', 'hollywood regency', 'maximalist', 'memphis', 'postmodern',
    'southwestern', 'tribal', 'tropical', 'victorian', 'edwardian', 'art nouveau',
    'arts and crafts', 'craftsman', 'mission', 'prairie school', 'tudor', 'colonial',
    'federal', 'georgian', 'greek revival', 'neoclassical', 'regency', 'spanish colonial',
    'mediterranean', 'french country', 'tuscan', 'english country', 'coastal grandmother',
    'grandmillennial', 'dark academia', 'light academia', 'cottagegoth', 'goblincore',
    'fairycore', 'angelcore', 'royaltycore', 'princesscore', 'dragoncore', 'piratecore',
    'steampunk', 'cyberpunk', 'dieselpunk', 'atompunk', 'solarpunk', 'vaporwave',
    'synthwave', 'outrun', 'retrowave', 'chillwave', 'lofi', 'grunge', 'punk', 'emo',
    'scene', 'y2k', '90s', '80s', '70s', '60s', '50s', '40s', '30s', '20s', 'western',
    'rodeo', 'equestrian', 'athletic', 'athleisure', 'streetwear', 'techwear',
    'avant-garde', 'futuristic', 'space age', 'atomic age', 'brutalist', 'organic modern',
    'japandi', 'hygge'
  ],
  
  BuyerIntent: [
    'gift for wife', 'gift for husband', 'gift for mom', 'gift for dad', 'gift for best friend',
    'housewarming gift', 'birthday gift for her', 'birthday gift for him', 'baby shower gift',
    // ... (truncated for brevity, full list in actual file)
  ],
  
  Seasonal: [
    'christmas ornament', 'christmas stocking', 'christmas gift for her', 'halloween decor',
    // ... (truncated for brevity)
  ],
  
  Patterns: [
    '{adjective} {material} {product}',
    '{style} {product}',
    'personalized {product} for {recipient}',
    'custom {product} with {feature}',
    '{event} gift for {recipient}',
    // ... (full list in actual file)
  ]
};

async function seedKeywords() {
  console.log('🌱 Starting keyword database seed...');

  try {
    // Seed Product Keywords
    for (const [category, keywords] of Object.entries(MANUS_DATASET.ProductKeywords)) {
      const keywordData = keywords.map(kw => ({
        keyword: kw,
        category: 'ProductKeywords',
        subcategory: category,
        type: 'product'
      }));

      const result = await prisma.keyword.createMany({
        data: keywordData,
        skipDuplicates: true
      });

      console.log(`✓ Seeded ${result.count} keywords for ${category}`);
    }

    // Seed Materials
    const materialData = MANUS_DATASET.Materials.map(m => ({
      keyword: m,
      category: 'Materials',
      type: 'material'
    }));

    const materialsResult = await prisma.keyword.createMany({
      data: materialData,
      skipDuplicates: true
    });

    console.log(`✓ Seeded ${materialsResult.count} materials`);

    // Seed Styles
    const styleData = MANUS_DATASET.Styles.map(s => ({
      keyword: s,
      category: 'Styles',
      type: 'style'
    }));

    const stylesResult = await prisma.keyword.createMany({
      data: styleData,
      skipDuplicates: true
    });

    console.log(`✓ Seeded ${stylesResult.count} styles`);

    // Seed Long-Tail Patterns
    const patternData = MANUS_DATASET.Patterns.map(p => {
      const variables = extractVariables(p);
      return {
        pattern: p,
        variables: variables,
        category: 'general',
        description: `Pattern with variables: ${variables.join(', ')}`
      };
    });

    const patternsResult = await prisma.longTailPattern.createMany({
      data: patternData,
      skipDuplicates: true
    });

    console.log(`✓ Seeded ${patternsResult.count} long-tail patterns`);

    console.log('✅ Keyword database seed completed successfully');
  } catch (error) {
    console.error('❌ Error seeding keywords:', error);
    throw error;
  }
}

function extractVariables(pattern: string): string[] {
  const matches = pattern.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/[{}]/g, ''));
}

// Run seed
seedKeywords()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
