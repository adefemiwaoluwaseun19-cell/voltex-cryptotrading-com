-- ============ profiles ============
create table public.profiles (
  id uuid primary key,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ============ wallets (cash balance) ============
create table public.wallets (
  user_id uuid primary key,
  cash_usd numeric(18,2) not null default 10000.00,
  updated_at timestamptz not null default now()
);

-- ============ holdings ============
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  coin_id text not null,
  amount numeric(30,8) not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, coin_id)
);

-- ============ transactions ============
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null check (kind in ('buy','sell')),
  coin_id text not null,
  units numeric(30,8) not null,
  price_usd numeric(20,8) not null,
  total_usd numeric(18,2) not null,
  fee_usd numeric(18,2) not null,
  created_at timestamptz not null default now()
);

create index transactions_user_recent on public.transactions (user_id, created_at desc);

-- ============ grants ============
grant select, update on public.profiles to authenticated;
grant select, update on public.wallets to authenticated;
grant select, insert, update, delete on public.holdings to authenticated;
grant select on public.transactions to authenticated;
grant all on public.profiles, public.wallets, public.holdings, public.transactions to service_role;

-- ============ RLS ============
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.holdings enable row level security;
alter table public.transactions enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can view their own wallet"
  on public.wallets for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can view their own holdings"
  on public.holdings for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can view their own transactions"
  on public.transactions for select to authenticated
  using (auth.uid() = user_id);

-- ============ auto-create profile + wallet on signup ============
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ atomic trade execution ============
create or replace function public.execute_trade(
  _coin_id text,
  _side text,
  _price_usd numeric,
  _usd_amount numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_fee numeric;
  v_total numeric;
  v_units numeric;
  v_cash numeric;
  v_amount numeric;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;
  if _side not in ('buy', 'sell') then
    raise exception 'Invalid order side';
  end if;
  if _price_usd is null or _price_usd <= 0 or _usd_amount is null or _usd_amount <= 0 then
    raise exception 'Invalid trade amount';
  end if;

  select cash_usd into v_cash from public.wallets where user_id = v_uid for update;
  if v_cash is null then
    raise exception 'Wallet not found';
  end if;

  if _side = 'buy' then
    v_fee := round(_usd_amount * 0.004, 2);
    v_total := _usd_amount + v_fee;
    if v_cash < v_total then
      raise exception 'Insufficient cash balance';
    end if;
    v_units := _usd_amount / _price_usd;

    update public.wallets
      set cash_usd = cash_usd - v_total, updated_at = now()
      where user_id = v_uid;

    insert into public.holdings (user_id, coin_id, amount)
    values (v_uid, _coin_id, v_units)
    on conflict (user_id, coin_id)
    do update set amount = public.holdings.amount + excluded.amount;

    insert into public.transactions (user_id, kind, coin_id, units, price_usd, total_usd, fee_usd)
    values (v_uid, 'buy', _coin_id, v_units, _price_usd, v_total, v_fee);

    return jsonb_build_object('units', v_units, 'total', v_total, 'fee', v_fee, 'cash', v_cash - v_total);
  else
    v_units := _usd_amount / _price_usd;

    select amount into v_amount from public.holdings
      where user_id = v_uid and coin_id = _coin_id for update;
    if v_amount is null or v_amount < v_units then
      raise exception 'Not enough of this asset to sell';
    end if;

    v_fee := round(_usd_amount * 0.004, 2);
    v_total := _usd_amount - v_fee;

    update public.holdings
      set amount = amount - v_units
      where user_id = v_uid and coin_id = _coin_id;

    update public.wallets
      set cash_usd = cash_usd + v_total, updated_at = now()
      where user_id = v_uid;

    insert into public.transactions (user_id, kind, coin_id, units, price_usd, total_usd, fee_usd)
    values (v_uid, 'sell', _coin_id, v_units, _price_usd, v_total, v_fee);

    return jsonb_build_object('units', v_units, 'total', v_total, 'fee', v_fee, 'cash', v_cash + v_total);
  end if;
end;
$$;

grant execute on function public.execute_trade(text, text, numeric, numeric) to authenticated;