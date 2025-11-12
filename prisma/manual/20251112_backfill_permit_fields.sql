ALTER TABLE "DistributionListItem"
  ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "responseAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "responseType" "PermitResponseType";

ALTER TABLE "Permit"
  ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "responseAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "responseType" "PermitResponseType";


