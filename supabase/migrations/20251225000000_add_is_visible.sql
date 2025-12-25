-- Add is_visible column to cost_constants table
ALTER TABLE cost_constants 
ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;

-- Update existing records to be visible by default
UPDATE cost_constants 
SET is_visible = TRUE 
WHERE is_visible IS NULL;

-- Comment on column
COMMENT ON COLUMN cost_constants.is_visible IS 'Controls whether the consumable is visible in calculator selection lists';
