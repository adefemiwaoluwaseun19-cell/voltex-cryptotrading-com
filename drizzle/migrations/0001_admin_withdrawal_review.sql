CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

CREATE POLICY "Admins can view all withdrawals" ON public.withdrawals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.review_withdrawal(_id uuid, _approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare w public.withdrawals%rowtype;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  select * into w from public.withdrawals where id = _id for update;
  if w.id is null then raise exception 'Request not found'; end if;
  if w.status <> 'pending' then raise exception 'Request already reviewed'; end if;
  if _approve then
    update public.withdrawals set status = 'completed' where id = _id;
  else
    update public.withdrawals set status = 'rejected' where id = _id;
    insert into public.holdings (user_id, coin_id, amount) values (w.user_id, w.coin_id, w.units)
      on conflict (user_id, coin_id) do update set amount = public.holdings.amount + excluded.amount;
    insert into public.transactions (user_id, kind, coin_id, units, price_usd, total_usd, fee_usd)
      values (w.user_id, 'refund', w.coin_id, w.units, w.price_usd, round(w.units * w.price_usd, 2), 0);
  end if;
end; $$;
REVOKE ALL ON FUNCTION public.review_withdrawal(uuid, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.review_withdrawal(uuid, boolean) TO authenticated;