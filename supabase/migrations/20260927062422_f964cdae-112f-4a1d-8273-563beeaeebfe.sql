ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text, ADD COLUMN IF NOT EXISTS date_of_birth date, ADD COLUMN IF NOT EXISTS address_line1 text, ADD COLUMN IF NOT EXISTS address_line2 text, ADD COLUMN IF NOT EXISTS city text, ADD COLUMN IF NOT EXISTS state_region text, ADD COLUMN IF NOT EXISTS postal_code text, ADD COLUMN IF NOT EXISTS country text;
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m jsonb := coalesce(NEW.raw_user_meta_data, '{}'::jsonb);
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, full_name, date_of_birth, address_line1, address_line2, city, state_region, postal_code, country)
  VALUES (NEW.id,
    coalesce(nullif(m->>'full_name',''), m->>'name', split_part(NEW.email,'@',1), ''),
    m->>'avatar_url', nullif(m->>'full_name',''),
    CASE WHEN coalesce(m->>'date_of_birth','') ~ '^\d{4}-\d{2}-\d{2}$' THEN (m->>'date_of_birth')::date END,
    m->>'address_line1', m->>'address_line2', m->>'city', m->>'state_region', m->>'postal_code', m->>'country')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.wallets (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;