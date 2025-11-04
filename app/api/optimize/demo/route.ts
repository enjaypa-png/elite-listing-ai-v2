import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

// Structured logging
function logInfo(message: string, data?: any) {
  console.log(JSON.stringify({ level: 'info', message, ...data, timestamp: new Date().toISOString() }))
}

function logError(message: string, error?: any) {
  console.error(JSON.stringify({ 
    level: 'error', 
    message, 
    error: error?.message,
    timestamp: new Date().toISOString() 
  }))
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    logInfo('Optimize demo requested', { userId: user.id })

    // Check credit balance
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { balance: true }
    })

    const currentBalance = latestLedger?.balance || 0

    if (currentBalance < 1) {
      logError('Insufficient credits for demo', { userId: user.id, balance: currentBalance })
      return NextResponse.json(
        { error: 'Insufficient credits. Purchase credits to try optimization.' },
        { status: 400 }
      )
    }

    // Seeded demo data
    const demoTitle = "Handmade Ceramic Coffee Mug - Rustic Blue Pottery"
    const demoDescription = "Beautiful handmade ceramic mug perfect for your morning coffee. Each piece is unique and crafted with care."
    const demoTags = ["ceramic", "handmade", "coffee mug", "pottery", "rustic"]

    // Create optimization record
    const optimizationId = `demo_${Date.now()}_${user.id.substring(0, 8)}`
    
    // Deduct 1 credit (USAGE transaction)
    const newBalance = currentBalance - 1
    
    await prisma.creditLedger.create({
      data: {
        userId: user.id,
        amount: -1,
        balance: newBalance,
        transactionType: 'usage',
        description: 'Demo optimization - AI listing enhancement',
        referenceId: optimizationId,
        relatedResourceId: optimizationId,
        metadata: {
          type: 'demo',
          platform: 'etsy',
          originalTitle: demoTitle
        }
      }
    })

    logInfo('Credit deducted for demo', {
      userId: user.id,
      previousBalance: currentBalance,
      newBalance,
      optimizationId
    })

    // Generate 3 demo variants (mock AI responses)
    const variants = [
      {
        variant_number: 1,
        title: "Handcrafted Blue Ceramic Coffee Mug | Rustic Pottery | Unique Kitchen Gift",
        description: "Start your day with this stunning handmade ceramic mug. Each piece features a beautiful rustic blue glaze and is crafted by skilled artisans. Perfect for coffee lovers who appreciate unique, handcrafted items. Dishwasher and microwave safe.",
        tags: ["handmade mug", "ceramic coffee cup", "blue pottery", "rustic kitchen", "artisan gift"],
        seo_score: 85,
        readability_score: 90,
        engagement_score: 88,
        improvements: [
          "Added specific color in title for better searchability",
          "Included 'gift' keyword for increased discoverability",
          "Enhanced description with care instructions",
          "Optimized tags for Etsy search algorithm"
        ]
      },
      {
        variant_number: 2,
        title: "Rustic Blue Pottery Mug | Handmade Ceramic Cup | Coffee Lover Gift",
        description: "Elevate your coffee ritual with this one-of-a-kind handmade ceramic mug. Featuring a gorgeous rustic blue glaze, this artisan piece brings warmth and character to your morning routine. Each mug is individually crafted, making yours truly unique.",
        tags: ["pottery mug", "handmade ceramic", "coffee gift", "blue glaze", "artisan cup"],
        seo_score: 82,
        readability_score: 92,
        engagement_score: 85,
        improvements: [
          "Led with 'Rustic Blue' for visual appeal",
          "Emphasized uniqueness to drive conversions",
          "Added emotional language ('elevate', 'warmth')",
          "Targeted coffee enthusiast audience"
        ]
      },
      {
        variant_number: 3,
        title: "Unique Blue Ceramic Mug | Handmade Pottery Coffee Cup | Artisan Kitchen Decor",
        description: "This exquisite handmade ceramic mug combines functionality with artistry. The rustic blue glaze creates a stunning visual while the ergonomic design ensures comfortable daily use. A perfect addition to your kitchen or a thoughtful gift for pottery enthusiasts.",
        tags: ["unique mug", "handmade pottery", "ceramic art", "kitchen decor", "coffee cup"],
        seo_score: 87,
        readability_score: 88,
        engagement_score: 90,
        improvements: [
          "Positioned as 'kitchen decor' for broader appeal",
          "Highlighted functional benefits (ergonomic)",
          "Used 'exquisite' for premium positioning",
          "Targeted both personal use and gift buyers"
        ]
      }
    ]

    const result = {
      success: true,
      message: 'Demo optimization completed successfully',
      optimization: {
        id: optimizationId,
        platform: 'etsy',
        original: {
          title: demoTitle,
          description: demoDescription,
          tags: demoTags
        },
        variants,
        credits_used: 1,
        new_balance: newBalance,
        created_at: new Date().toISOString()
      }
    }

    logInfo('Demo optimization completed', {
      userId: user.id,
      optimizationId,
      variantsGenerated: variants.length,
      newBalance
    })

    return NextResponse.json(result)

  } catch (error: any) {
    logError('Demo optimization failed', error)
    return NextResponse.json(
      { error: error.message || 'Failed to complete demo optimization' },
      { status: 500 }
    )
  }
}
