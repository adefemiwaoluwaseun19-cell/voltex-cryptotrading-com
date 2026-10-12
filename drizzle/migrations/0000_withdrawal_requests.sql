CREATE TABLE public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  coin_id text NOT NULL,
  units numeric NOT NULL,
  price_usd numeric NOT NULL,
  address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.request_withdrawal(_coin_id text, _units numeric, _price_usd numeric, _address text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare v_uid uuid := auth.uid(); v_amount numeric; v_id uuid;
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  if _units is null or _units <= 0 or _price_usd is null or _price_usd <= 0 then raise exception 'Invalid amount'; end if;
  if _address is null or length(_address) < 20 or length(_address) > 120 then raise exception 'Invalid wallet address'; end if;
  select amount into v_amount from public.holdings where user_id = v_uid and coin_id = _coin_id for update;
  if v_amount is null or v_amount < _units then raise exception 'Not enough of this asset to send'; end if;
  update public.holdings set amount = amount - _units where user_id = v_uid and coin_id = _coin_id;
  insert into public.withdrawals (user_id, coin_id, units, price_usd, address)
    values (v_uid, _coin_id, _units, _price_usd, _address) returning id into v_id;
  insert into public.transactions (user_id, kind, coin_id, units, price_usd, total_usd, fee_usd)
    values (v_uid, 'send', _coin_id, _units, _price_usd, round(_units * _price_usd, 2), 0);
  return v_id;
end; $$;
REVOKE ALL ON FUNCTION public.request_withdrawal(text, numeric, numeric, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(text, numeric, numeric, text) TO authenticated;