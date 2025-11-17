import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const SEED_TOKEN = process.env.SEED_TOKEN || "SEED123";

export async function GET(req: Request) {
  try {
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

    let keywordCount = 0;
    let patternCount = 0;

    // Seed Keywords
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
        keywordCount++;
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
      keywordCount++;
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
      keywordCount++;
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
      keywordCount++;
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
      keywordCount++;
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
      patternCount++;
    }

    return NextResponse.json({
      ok: true,
      insertedKeywords: keywordCount,
      insertedPatterns: patternCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
