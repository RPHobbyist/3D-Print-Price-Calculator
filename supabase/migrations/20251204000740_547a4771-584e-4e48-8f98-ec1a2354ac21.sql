-- Create saved_quotes table for permanent storage
CREATE TABLE public.saved_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_name TEXT NOT NULL,
  print_type TEXT NOT NULL,
  print_colour TEXT,
  material_cost NUMERIC NOT NULL,
  machine_time_cost NUMERIC NOT NULL,
  electricity_cost NUMERIC NOT NULL,
  labor_cost NUMERIC NOT NULL,
  overhead_cost NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  markup NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_quotes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can view saved quotes" 
ON public.saved_quotes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert saved quotes" 
ON public.saved_quotes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update saved quotes" 
ON public.saved_quotes 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete saved quotes" 
ON public.saved_quotes 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_saved_quotes_updated_at
BEFORE UPDATE ON public.saved_quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();