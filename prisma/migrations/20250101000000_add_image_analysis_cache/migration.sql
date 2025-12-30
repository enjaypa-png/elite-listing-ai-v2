-- CreateTable
CREATE TABLE "image_analysis_cache" (
    "id" TEXT NOT NULL,
    "imageHash" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "hasSevereBlur" BOOLEAN NOT NULL,
    "hasSevereLighting" BOOLEAN NOT NULL,
    "isProductDistinguishable" BOOLEAN NOT NULL,
    "thumbnailCropSafe" BOOLEAN,
    "aiAnalysisRaw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "useCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "image_analysis_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "image_analysis_cache_imageHash_key" ON "image_analysis_cache"("imageHash");

-- CreateIndex
CREATE INDEX "image_analysis_cache_createdAt_idx" ON "image_analysis_cache"("createdAt");

-- Add missing index on ListingAnalysis.expiresAt for cleanup queries
CREATE INDEX "listing_analyses_expiresAt_idx" ON "listing_analyses"("expiresAt");
