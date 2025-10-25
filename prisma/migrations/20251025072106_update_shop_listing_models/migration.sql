/*
  Warnings:

  - You are about to drop the column `externalId` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `originalData` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `apiKey` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `apiSecret` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `shops` table. All the data in the column will be lost.
  - You are about to drop the column `platformId` on the `shops` table. All the data in the column will be lost.
  - Added the required column `imageUrls` to the `listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformListingId` to the `listings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tags` to the `listings` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `listings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `listings` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `platformShopId` to the `shops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopName` to the `shops` table without a default value. This is not possible if the table is not empty.
  - Made the column `accessToken` on table `shops` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "platformListingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "url" TEXT,
    "imageUrls" JSONB NOT NULL,
    "tags" JSONB NOT NULL,
    "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "listings_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_listings" ("createdAt", "currency", "description", "id", "price", "shopId", "status", "title", "updatedAt") SELECT "createdAt", coalesce("currency", 'USD') AS "currency", "description", "id", "price", "shopId", "status", "title", "updatedAt" FROM "listings";
DROP TABLE "listings";
ALTER TABLE "new_listings" RENAME TO "listings";
CREATE UNIQUE INDEX "listings_shopId_platformListingId_key" ON "listings"("shopId", "platformListingId");
CREATE TABLE "new_shops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformShopId" TEXT NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopUrl" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shops_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_shops" ("accessToken", "createdAt", "id", "isActive", "platform", "updatedAt", "userId") SELECT "accessToken", "createdAt", "id", "isActive", "platform", "updatedAt", "userId" FROM "shops";
DROP TABLE "shops";
ALTER TABLE "new_shops" RENAME TO "shops";
CREATE UNIQUE INDEX "shops_userId_platform_platformShopId_key" ON "shops"("userId", "platform", "platformShopId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
