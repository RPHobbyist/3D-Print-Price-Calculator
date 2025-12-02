-- Create enum for print types
CREATE TYPE print_type AS ENUM ('FDM', 'Resin');

-- Table for material presets
CREATE TABLE public.material_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  print_type print_type NOT NULL,
  cost_per_unit DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL, -- 'kg' for FDM, 'liter' for Resin
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for machine presets
CREATE TABLE public.machine_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  print_type print_type NOT NULL,
  hourly_cost DECIMAL(10, 2) NOT NULL,
  power_consumption_watts INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table for cost constants
CREATE TABLE public.cost_constants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  value DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.material_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_constants ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow everyone to read (public data)
CREATE POLICY "Anyone can view material presets"
  ON public.material_presets FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view machine presets"
  ON public.machine_presets FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view cost constants"
  ON public.cost_constants FOR SELECT
  USING (true);

-- For now, allow anyone to modify (you can add admin checks later)
CREATE POLICY "Anyone can insert material presets"
  ON public.material_presets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update material presets"
  ON public.material_presets FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete material presets"
  ON public.material_presets FOR DELETE
  USING (true);

CREATE POLICY "Anyone can insert machine presets"
  ON public.machine_presets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update machine presets"
  ON public.machine_presets FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete machine presets"
  ON public.machine_presets FOR DELETE
  USING (true);

CREATE POLICY "Anyone can insert cost constants"
  ON public.cost_constants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update cost constants"
  ON public.cost_constants FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete cost constants"
  ON public.cost_constants FOR DELETE
  USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for auto-updating timestamps
CREATE TRIGGER update_material_presets_updated_at
  BEFORE UPDATE ON public.material_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_machine_presets_updated_at
  BEFORE UPDATE ON public.machine_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_constants_updated_at
  BEFORE UPDATE ON public.cost_constants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.material_presets (name, print_type, cost_per_unit, unit, description) VALUES
  ('PLA Standard', 'FDM', 25.00, 'kg', 'Standard PLA filament'),
  ('PETG', 'FDM', 30.00, 'kg', 'PETG filament - durable'),
  ('ABS', 'FDM', 28.00, 'kg', 'ABS filament - high temperature'),
  ('TPU Flexible', 'FDM', 45.00, 'kg', 'Flexible TPU filament'),
  ('Standard Resin', 'Resin', 50.00, 'liter', 'Standard UV resin'),
  ('Tough Resin', 'Resin', 75.00, 'liter', 'High durability resin'),
  ('Flexible Resin', 'Resin', 85.00, 'liter', 'Flexible UV resin');

INSERT INTO public.machine_presets (name, print_type, hourly_cost, power_consumption_watts, description) VALUES
  ('Ender 3 V2', 'FDM', 5.00, 250, 'Entry level FDM printer'),
  ('Prusa i3 MK3S+', 'FDM', 8.00, 280, 'Mid-range FDM printer'),
  ('Bambu Lab X1', 'FDM', 12.00, 350, 'High-end FDM printer'),
  ('Anycubic Photon Mono', 'Resin', 6.00, 120, 'Entry level resin printer'),
  ('Elegoo Saturn 2', 'Resin', 10.00, 150, 'Mid-range resin printer'),
  ('Formlabs Form 3', 'Resin', 20.00, 200, 'Professional resin printer');

INSERT INTO public.cost_constants (name, value, unit, description) VALUES
  ('electricity_rate', 0.15, '$/kWh', 'Cost per kilowatt-hour'),
  ('labor_rate', 25.00, '$/hour', 'Labor cost per hour'),
  ('overhead_percentage', 15.00, '%', 'Business overhead percentage'),
  ('markup_percentage', 20.00, '%', 'Profit markup percentage'),
  ('isopropyl_cost', 2.00, '$/use', 'IPA cleaning cost per print');