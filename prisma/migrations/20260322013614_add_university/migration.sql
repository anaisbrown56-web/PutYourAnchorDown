-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "vibes" TEXT NOT NULL,
    "priceLevel" TEXT NOT NULL,
    "university" TEXT NOT NULL DEFAULT '',
    "avgWaitMinutes" REAL NOT NULL DEFAULT 0,
    "avgRating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Location" ("address", "avgRating", "avgWaitMinutes", "category", "createdAt", "description", "id", "imageUrl", "name", "priceLevel", "reviewCount", "vibes") SELECT "address", "avgRating", "avgWaitMinutes", "category", "createdAt", "description", "id", "imageUrl", "name", "priceLevel", "reviewCount", "vibes" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
