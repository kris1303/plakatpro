DO $$
BEGIN
  CREATE TYPE "EmailDirection" AS ENUM ('outbound', 'inbound');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TYPE "EmailStatus" AS ENUM ('queued', 'sent', 'delivered', 'failed', 'received');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

CREATE TABLE IF NOT EXISTS "PermitEmail" (
  "id" TEXT PRIMARY KEY,
  "distributionListItemId" TEXT,
  "permitId" TEXT,
  "direction" "EmailDirection" NOT NULL,
  "status" "EmailStatus" NOT NULL DEFAULT 'queued',
  "subject" TEXT NOT NULL,
  "bodyText" TEXT,
  "bodyHtml" TEXT,
  "attachments" JSONB,
  "providerMessageId" TEXT,
  "messageId" TEXT,
  "threadId" TEXT,
  "sentAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PermitEmail_distributionListItemId_fkey'
  ) THEN
      ALTER TABLE "PermitEmail"
        ADD CONSTRAINT "PermitEmail_distributionListItemId_fkey"
        FOREIGN KEY ("distributionListItemId")
        REFERENCES "DistributionListItem"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PermitEmail_permitId_fkey'
  ) THEN
      ALTER TABLE "PermitEmail"
        ADD CONSTRAINT "PermitEmail_permitId_fkey"
        FOREIGN KEY ("permitId")
        REFERENCES "Permit"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END;
$$;
