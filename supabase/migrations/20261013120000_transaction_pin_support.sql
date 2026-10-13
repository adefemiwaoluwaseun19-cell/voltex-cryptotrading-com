CREATE TABLE IF NOT EXISTS public.transaction_pins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transaction_pins_locked_until
  ON public.transaction_pins (locked_until);

ALTER TABLE public.transaction_pins ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transaction_pins TO authenticated;
GRANT ALL ON public.transaction_pins TO service_role;

CREATE POLICY "Users can manage their own transaction pin"
  ON public.transaction_pins
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transaction pins"
  ON public.transaction_pins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
