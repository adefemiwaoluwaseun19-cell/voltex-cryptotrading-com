CREATE TABLE public.cash_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount_usd numeric NOT NULL CHECK (amount_usd > 0),
  method text NOT NULL CHECK (method IN ('card','bank')),
  holder_name text NOT NULL,
  last4 text NOT NULL CHECK (last4 ~ '^\d{4}$'),
  bank_name text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cash_withdrawals TO authenticated;
GRANT ALL ON public.cash_withdrawals TO service_role;
ALTER TABLE public.cash_withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cash withdrawals" ON public.cash_withdrawals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all cash withdrawals" ON public.cash_withdrawals FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.request_cash_withdrawal(_amount numeric, _method text, _holder text, _last4 text, _bank text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare v_uid uuid := auth.uid(); v_cash numeric; v_id uuid;
begin
  if v_uid is null then raise exception 'Not signed in'; end if;
  if _amount is null or _amount < 10 then raise exception 'Minimum withdrawal is $10'; end if;
  if _method not in ('card','bank') then raise exception 'Invalid method'; end if;
  if _holder is null or length(trim(_holder)) < 2 or length(_holder) > 100 then raise exception 'Enter the account holder name'; end if;
  if _last4 !~ '^\d{4}$' then raise exception 'Invalid card or account number'; end if;
  select cash_usd into v_cash from public.wallets where user_id = v_uid for update;
  if v_cash is null or v_cash < _amount then raise exception 'Insufficient cash balance'; end if;
  update public.wallets set cash_usd = cash_usd - _amount, updated_at = now() where user_id = v_uid;
  insert into public.cash_withdrawals (user_id, amount_usd, method, holder_name, last4, bank_name)
    values (v_uid, round(_amount,2), _method, trim(_holder), _last4, nullif(trim(coalesce(_bank,'')),'')) returning id into v_id;
  insert into public.transactions (user_id, kind, coin_id, units, price_usd, total_usd, fee_usd)
    values (v_uid, 'cashout', 'usd', round(_amount,2), 1, round(_amount,2), 0);
  return v_id;
end; $$;

CREATE OR REPLACE FUNCTION public.review_cash_withdrawal(_id uuid, _approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
declare w public.cash_withdrawals%rowtype;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  select * into w from public.cash_withdrawals where id = _id for update;
  if w.id is null then raise exception 'Request not found'; end if;
  if w.status <> 'pending' then raise exception 'Request already reviewed'; end if;
  if _approve then
    update public.cash_withdrawals set status = 'completed' where id = _id;
  else
    update public.cash_withdrawals set status = 'rejected' where id = _id;
    update public.wallets set cash_usd = cash_usd + w.amount_usd, updated_at = now() where user_id = w.user_id;
    insert into public.transactions (user_id, kind, coin_id, units, price_usd, total_usd, fee_usd)
      values (w.user_id, 'refund', 'usd', w.amount_usd, 1, w.amount_usd, 0);
  end if;
end; $$;
REVOKE EXECUTE ON FUNCTION public.request_cash_withdrawal(numeric,text,text,text,text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.review_cash_withdrawal(uuid,boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.request_cash_withdrawal(numeric,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_cash_withdrawal(uuid,boolean) TO authenticated;