import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Seed endpoint - completely rewritten to avoid any undefined variables
const SEED_TOKEN = process.env.SEED_TOKEN || "SEED123";

export async function GET(req: Request) {
  try {
    // Validate token
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (token !== SEED_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Import Manus dataset
    const dataset = await import("@/prisma/manusDataset.json");

    let inserted = 0;

    // Seed Product Keywords
    for (const [category, items] of Object.entries(dataset.ProductKeywords)) {
      for (const item of items as string[]) {
        await prisma.keyword.upsert({
          where: { keyword: item },
          update: {},
          create: {
            keyword: item,
            category: category,
            type: "product",
          },
        });
        inserted++;
      }
    }

    // Seed Materials
    for (const material of dataset.Materials) {
      await prisma.keyword.upsert({
        where: { keyword: material },
        update: {},
        create: {
          keyword: material,
          category: "materials",
          type: "material",
        },
      });
      inserted++;
    }

    // Seed Styles
    for (const style of dataset.Styles) {
      await prisma.keyword.upsert({
        where: { keyword: style },
        update: {},
        create: {
          keyword: style,
          category: "styles",
          type: "style",
        },
      });
      inserted++;
    }

    // Seed Buyer Intent
    for (const intent of dataset.BuyerIntent) {
      await prisma.keyword.upsert({
        where: { keyword: intent },
        update: {},
        create: {
          keyword: intent,
          category: "buyer_intent",
          type: "intent",
        },
      });
      inserted++;
    }

    // Seed Seasonal
    for (const item of dataset.Seasonal) {
      await prisma.keyword.upsert({
        where: { keyword: item },
        update: {},
        create: {
          keyword: item,
          category: "seasonal",
          type: "seasonal",
        },
      });
      inserted++;
    }

    // Seed Patterns
    for (const pattern of dataset.Patterns) {
      await prisma.longTailPattern.upsert({
        where: { pattern },
        update: {},
        create: {
          pattern,
          category: "general",
          variables: JSON.stringify([]),
        },
      });
      inserted++;
    }

    return NextResponse.json({
      ok: true,
      inserted: inserted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
