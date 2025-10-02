-- Add google_ads and googel_ads columns to store Google Ads Transparency Center data
ALTER TABLE "5LEAD TEST" 
ADD COLUMN IF NOT EXISTS google_ads jsonb,
ADD COLUMN IF NOT EXISTS googel_ads jsonb;