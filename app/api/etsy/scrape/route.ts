import { NextRequest, NextResponse } from 'next/server';
import { scrapeEtsyListing } from '@/lib/etsyScraper';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Missing URL parameter' },
        { status: 400 }
      );
    }

    // Validate Etsy URL
    if (!url.includes('etsy.com/listing/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid Etsy URL. Must include "etsy.com/listing/"' },
        { status: 400 }
      );
    }

    console.log('[Etsy Scraper] Scraping URL:', url);

    // Scrape the listing
    const listingData = await scrapeEtsyListing(url);

    if (!listingData.success) {
      return NextResponse.json(
        { success: false, error: listingData.error || 'Failed to scrape listing' },
        { status: 500 }
      );
    }

    console.log('[Etsy Scraper] Successfully scraped listing:', listingData.listingId);

    return NextResponse.json({
      success: true,
      data: {
        listingId: listingData.listingId,
        title: listingData.title,
        description: listingData.description,
        tags: listingData.tags,
        price: listingData.price,
        images: listingData.images,
        category: listingData.category,
        imageCount: listingData.images.length,
        tagCount: listingData.tags.length
      }
    });
  } catch (error: any) {
    console.error('[Etsy Scraper] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/etsy/scrape',
    method: 'POST',
    description: 'Scrapes Etsy listing data from URL',
    requiredFields: ['url'],
    example: {
      url: 'https://www.etsy.com/listing/123456789/product-name'
    }
  });
}
