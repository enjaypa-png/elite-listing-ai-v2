'use client'

import { useState } from 'react'
import { Card, Button, Input, Alert } from '@/components/ui'
import tokens from '@/design-system/tokens.json'

interface ImportedListing {
  id: string
  title: string
  description: string
  imageUrls: string[]
  tags: string[]
  price: number
  currency: string
}

interface ListingImporterProps {
  onListingImported: (listing: ImportedListing) => void
}

export function ListingImporter({ onListingImported }: ListingImporterProps) {
  const [listingUrl, setListingUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState('')

  const handleImport = async () => {
    if (!listingUrl.trim()) {
      setError('Please enter an Etsy listing URL')
      return
    }

    // Extract listing ID from URL
    const listingIdMatch = listingUrl.match(/listing\/(\d+)/)
    if (!listingIdMatch) {
      setError('Invalid Etsy listing URL. Should contain /listing/[ID]')
      return
    }

    setIsImporting(true)
    setError('')

    try {
      // For now, we'll use mock data since Etsy import requires auth
      // In production, this would call /api/etsy/import-single with the listing ID
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock imported listing with 10 photos
      const mockListing: ImportedListing = {
        id: listingIdMatch[1],
        title: 'Handmade Ceramic Coffee Mug - Artisan Pottery Gift for Coffee Lovers',
        description: 'Beautiful handmade ceramic coffee mug crafted with care. Perfect for coffee lovers who appreciate artisan pottery. Each mug is unique with slight variations in glaze and shape. Dishwasher and microwave safe. Makes a wonderful gift for birthdays, holidays, or any special occasion.',
        imageUrls: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
          'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d',
          'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
          'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
          'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7',
          'https://images.unsplash.com/photo-1501492680867-94c98d1fc6c5',
          'https://images.unsplash.com/photo-1516592703696-f9bc3c0f5e1d',
          'https://images.unsplash.com/photo-1460306855393-0410f61241c7'
        ],
        tags: [
          'ceramic mug',
          'handmade',
          'coffee cup',
          'artisan pottery',
          'coffee lover gift',
          'kitchen decor',
          'unique mug',
          'pottery gift',
          'handmade ceramics',
          'coffee mug set',
          'tea cup',
          'gift for him',
          'gift for her'
        ],
        price: 32.00,
        currency: 'USD'
      }

      onListingImported(mockListing)
    } catch (err: any) {
      setError(err.message || 'Failed to import listing')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card padding="8">
      <div style={{ marginBottom: tokens.spacing[4] }}>
        <h3 style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.text,
          marginBottom: tokens.spacing[2]
        }}>
          Import Etsy Listing
        </h3>
        <p style={{ 
          color: tokens.colors.textMuted,
          fontSize: tokens.typography.fontSize.sm
        }}>
          Enter an Etsy listing URL to analyze and optimize all photos
        </p>
      </div>

      {error && (
        <Alert variant="danger" style={{ marginBottom: tokens.spacing[4] }}>
          {error}
        </Alert>
      )}

      <div style={{ marginBottom: tokens.spacing[4] }}>
        <label style={{
          display: 'block',
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.medium,
          color: tokens.colors.text,
          marginBottom: tokens.spacing[2]
        }}>
          Etsy Listing URL
        </label>
        <Input
          value={listingUrl}
          onChange={(e) => setListingUrl(e.target.value)}
          placeholder="https://www.etsy.com/listing/123456789/..."
          disabled={isImporting}
        />
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={handleImport}
        disabled={isImporting || !listingUrl.trim()}
        fullWidth
      >
        {isImporting ? 'Importing...' : '🔗 Import & Analyze Photos'}
      </Button>

      <div style={{
        marginTop: tokens.spacing[4],
        padding: tokens.spacing[3],
        backgroundColor: tokens.colors.backgroundAlt,
        borderRadius: tokens.radius.md,
        borderLeft: `3px solid ${tokens.colors.primary}`
      }}>
        <p style={{ 
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.textMuted,
          lineHeight: '1.5'
        }}>
          <strong style={{ color: tokens.colors.text }}>Note:</strong> This will import your listing title, description, tags, and all 10 photos for comprehensive analysis.
        </p>
      </div>
    </Card>
  )
}