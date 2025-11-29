// Etsy Listing Scraper
// Extracts listing data from Etsy URLs using web scraping

interface EtsyListingData {
  success: boolean;
  listingId: string;
  title: string;
  description: string;
  tags: string[];
  price: number;
  images: string[];
  category: string;
  error?: string;
}

export async function scrapeEtsyListing(url: string): Promise<EtsyListingData> {
  try {
    // Extract listing ID from URL
    const listingIdMatch = url.match(/listing\/(\d+)/);
    if (!listingIdMatch) {
      return {
        success: false,
        listingId: '',
        title: '',
        description: '',
        tags: [],
        price: 0,
        images: [],
        category: '',
        error: 'Invalid Etsy URL - could not extract listing ID'
      };
    }

    const listingId = listingIdMatch[1];

    // Fetch the HTML page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        listingId,
        title: '',
        description: '',
        tags: [],
        price: 0,
        images: [],
        category: '',
        error: `Failed to fetch listing: ${response.status} ${response.statusText}`
      };
    }

    const html = await response.text();

    // Extract data using regex patterns (Etsy's HTML structure)
    const title = extractTitle(html);
    const description = extractDescription(html);
    const price = extractPrice(html);
    const images = extractImages(html);
    const tags = extractTags(html);
    const category = extractCategory(html);

    return {
      success: true,
      listingId,
      title,
      description,
      tags,
      price,
      images,
      category
    };
  } catch (error: any) {
    console.error('Etsy scraping error:', error);
    return {
      success: false,
      listingId: '',
      title: '',
      description: '',
      tags: [],
      price: 0,
      images: [],
      category: '',
      error: error.message || 'Unknown error occurred'
    };
  }
}

function extractTitle(html: string): string {
  // Try multiple patterns
  const patterns = [
    /<h1[^>]*class="[^"]*listing-page-title[^"]*"[^>]*>([^<]+)</i,
    /<h1[^>]*data-listing-title[^>]*>([^<]+)</i,
    /<meta property="og:title" content="([^"]+)"/i,
    /<title>([^|<]+)/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return 'Unable to extract title';
}

function extractDescription(html: string): string {
  // Try multiple patterns
  const patterns = [
    /<div[^>]*data-product-details-description[^>]*>([\s\S]*?)<\/div>/i,
    /<meta name="description" content="([^"]+)"/i,
    /<meta property="og:description" content="([^"]+)"/i,
    /<p[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/p>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      let desc = match[1].trim();
      // Clean HTML tags
      desc = desc.replace(/<[^>]+>/g, ' ');
      desc = desc.replace(/&nbsp;/g, ' ');
      desc = desc.replace(/&amp;/g, '&');
      desc = desc.replace(/&lt;/g, '<');
      desc = desc.replace(/&gt;/g, '>');
      desc = desc.replace(/\s+/g, ' ');
      return desc.trim();
    }
  }

  return 'Unable to extract description';
}

function extractPrice(html: string): number {
  // Try multiple patterns
  const patterns = [
    /"price":\s*"?([0-9.]+)"?/i,
    /<p[^>]*class="[^"]*price[^"]*"[^>]*>\$?([0-9.]+)/i,
    /<meta property="product:price:amount" content="([^"]+)"/i,
    /<span[^>]*class="[^"]*currency-value[^"]*"[^>]*>([0-9.]+)/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return parseFloat(match[1]);
    }
  }

  return 0;
}

function extractImages(html: string): string[] {
  const images: string[] = [];
  
  // Try multiple patterns
  const patterns = [
    /"url_fullxfull":"([^"]+)"/gi,
    /"url_570xN":"([^"]+)"/gi,
    /<img[^>]*data-listing-image[^>]*src="([^"]+)"/gi,
    /<meta property="og:image" content="([^"]+)"/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const imgUrl = match[1].replace(/\\u002F/g, '/');
      if (!images.includes(imgUrl) && imgUrl.includes('etsy')) {
        images.push(imgUrl);
      }
    }
  }

  // Remove duplicates and limit to 10
  return [...new Set(images)].slice(0, 10);
}

function extractTags(html: string): string[] {
  const tags: string[] = [];

  // Try to find tags in meta keywords
  const metaMatch = html.match(/<meta name="keywords" content="([^"]+)"/i);
  if (metaMatch) {
    tags.push(...metaMatch[1].split(',').map(t => t.trim()));
  }

  // Try to find tags in structured data
  const tagPattern = /"tags":\s*\[([^\]]+)\]/i;
  const tagMatch = html.match(tagPattern);
  if (tagMatch) {
    const tagData = tagMatch[1].match(/"([^"]+)"/g);
    if (tagData) {
      tags.push(...tagData.map(t => t.replace(/"/g, '').trim()));
    }
  }

  // Remove duplicates and limit to 13
  return [...new Set(tags)].slice(0, 13);
}

function extractCategory(html: string): string {
  // Try multiple patterns
  const patterns = [
    /<nav[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/nav>/i,
    /<ol[^>]*class="[^"]*breadcrumb[^"]*"[^>]*>([\s\S]*?)<\/ol>/i,
    /<meta property="product:category" content="([^"]+)"/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      // Extract text from breadcrumb
      const breadcrumb = match[1];
      const categoryMatch = breadcrumb.match(/>([^<>]+)</g);
      if (categoryMatch) {
        const categories = categoryMatch
          .map(m => m.replace(/[><]/g, '').trim())
          .filter(c => c.length > 0 && c !== 'Home' && c !== 'Etsy');
        return categories[categories.length - 1] || 'General';
      }
    }
  }

  return 'General';
}
