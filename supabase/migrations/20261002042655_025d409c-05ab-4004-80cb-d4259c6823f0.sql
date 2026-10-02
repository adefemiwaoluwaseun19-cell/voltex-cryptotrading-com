CREATE TABLE public.btc_addresses (
  user_id UUID PRIMARY KEY,
  derivation_index INTEGER GENERATED ALWAYS AS IDENTITY UNIQUE,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.btc_addresses TO authenticated;
GRANT ALL ON public.btc_addresses TO service_role;
ALTER TABLE public.btc_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own BTC address" ON public.btc_addresses FOR SELECT TO authenticated USING (auth.uid() = user_id);