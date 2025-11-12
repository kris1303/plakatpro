import { PrismaClient } from "@prisma/client";

let ensurePromise: Promise<void> | null = null;

export function ensureLatestSchema(prisma: PrismaClient) {
  if (ensurePromise) {
    return ensurePromise;
  }

  ensurePromise = (async () => {
    const statements: string[] = [
      // Campaign.archivedAt
      `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'Campaign'
            AND column_name = 'archivedAt'
        ) THEN
          ALTER TABLE "Campaign" ADD COLUMN "archivedAt" TIMESTAMP(3);
        END IF;
      END;
      $$;
      `,
      // DistributionList.archivedAt
      `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'DistributionList'
            AND column_name = 'archivedAt'
        ) THEN
          ALTER TABLE "DistributionList" ADD COLUMN "archivedAt" TIMESTAMP(3);
        END IF;
      END;
      $$;
      `,
      // DistributionList.posterImageAssetId
      `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'DistributionList'
            AND column_name = 'posterImageAssetId'
        ) THEN
          ALTER TABLE "DistributionList" ADD COLUMN "posterImageAssetId" TEXT;
        END IF;
      END;
      $$;
      `,
      // DistributionListItem.includePosterImage
      `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'DistributionListItem'
            AND column_name = 'includePosterImage'
        ) THEN
          ALTER TABLE "DistributionListItem" ADD COLUMN "includePosterImage" BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END;
      $$;
      `,
      // DistributionListItem.includePermitForm
      `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'DistributionListItem'
            AND column_name = 'includePermitForm'
        ) THEN
          ALTER TABLE "DistributionListItem" ADD COLUMN "includePermitForm" BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END;
      $$;
      `,
      // City.requiresPermitForm
      `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'City'
            AND column_name = 'requiresPermitForm'
        ) THEN
          ALTER TABLE "City" ADD COLUMN "requiresPermitForm" BOOLEAN NOT NULL DEFAULT false;
        END IF;
      END;
      $$;
      `,
      // City.permitFormAssetId
      `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'City'
            AND column_name = 'permitFormAssetId'
        ) THEN
          ALTER TABLE "City" ADD COLUMN "permitFormAssetId" TEXT;
        END IF;
      END;
      $$;
      `,
      // FileAsset table
      `
      CREATE TABLE IF NOT EXISTS "FileAsset" (
        "id" TEXT PRIMARY KEY,
        "key" TEXT NOT NULL UNIQUE,
        "fileName" TEXT NOT NULL,
        "contentType" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      `,
      // Ensure unique index on FileAsset.key (in case table existed without constraint)
      `
      CREATE UNIQUE INDEX IF NOT EXISTS "FileAsset_key_key" ON "FileAsset"("key");
      `,
      // Ensure default values for boolean columns (when column already existed but default missing)
      `ALTER TABLE "DistributionListItem" ALTER COLUMN "includePosterImage" SET DEFAULT false;`,
      `ALTER TABLE "DistributionListItem" ALTER COLUMN "includePermitForm" SET DEFAULT false;`,
      `ALTER TABLE "City" ALTER COLUMN "requiresPermitForm" SET DEFAULT false;`,
    ];

    const ignorePgCodes = new Set([
      "42701", // column already exists
      "42P07", // relation (table/index) already exists
      "23505", // unique violation (duplicate constraint)
    ]);

    async function safeExecute(sql: string) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (error: any) {
        if (
          error?.code === "P2010" &&
          ignorePgCodes.has(error?.meta?.code as string)
        ) {
          console.warn("Schema guard Hinweis (ignoriert):", error?.meta?.message ?? error);
          return;
        }
        throw error;
      }
    }

    for (const sql of statements) {
      await safeExecute(sql);
    }

    // Foreign key for DistributionList.posterImageAssetId
    await safeExecute(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'DistributionList_posterImageAssetId_fkey'
        ) THEN
          ALTER TABLE "DistributionList"
            ADD CONSTRAINT "DistributionList_posterImageAssetId_fkey"
            FOREIGN KEY ("posterImageAssetId")
            REFERENCES "FileAsset"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END;
      $$;
    `);

    // Foreign key for City.permitFormAssetId
    await safeExecute(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'City_permitFormAssetId_fkey'
        ) THEN
          ALTER TABLE "City"
            ADD CONSTRAINT "City_permitFormAssetId_fkey"
            FOREIGN KEY ("permitFormAssetId")
            REFERENCES "FileAsset"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END;
      $$;
    `);
  })().catch((error) => {
    console.error("Schema guard konnte nicht ausgeführt werden:", error);
    throw error;
  });

  return ensurePromise;
}


