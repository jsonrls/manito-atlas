create table public.website_daily_visitors (
  visit_date date not null,
  visitor_id uuid not null,
  first_seen_at timestamptz not null default now(),
  primary key (visit_date, visitor_id)
);

comment on table public.website_daily_visitors is
  'Pseudonymous daily unique website visitors. visitor_id is a random browser identifier; no email address or IP address is stored.';

create table public.website_traffic_snapshots (
  metric_date date primary key,
  daily_users bigint not null default 0 check (daily_users >= 0),
  weekly_users bigint not null default 0 check (weekly_users >= 0),
  monthly_users bigint not null default 0 check (monthly_users >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.website_traffic_snapshots is
  'Stored DAU, rolling 7-day WAU, and rolling 30-day MAU snapshots calculated in Asia/Manila time.';

alter table public.website_daily_visitors enable row level security;
alter table public.website_traffic_snapshots enable row level security;

revoke all on table public.website_daily_visitors from anon, authenticated;
revoke all on table public.website_traffic_snapshots from anon, authenticated;

grant all on table public.website_daily_visitors to service_role;
grant all on table public.website_traffic_snapshots to service_role;

create or replace function public.record_website_visit(p_visitor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := timezone('Asia/Manila', statement_timestamp())::date;
  v_inserted integer;
begin
  if p_visitor_id is null then
    raise exception 'A visitor id is required.' using errcode = '22004';
  end if;

  insert into public.website_daily_visitors (visit_date, visitor_id)
  values (v_today, p_visitor_id)
  on conflict (visit_date, visitor_id) do nothing;

  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return;
  end if;

  -- Serialize the small rollup update so simultaneous first visits do not
  -- overwrite one another with a stale aggregate.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('website-traffic-' || v_today::text));

  insert into public.website_traffic_snapshots (
    metric_date,
    daily_users,
    weekly_users,
    monthly_users,
    updated_at
  )
  select
    v_today,
    count(distinct visitor_id) filter (where visit_date = v_today),
    count(distinct visitor_id) filter (where visit_date >= v_today - 6),
    count(distinct visitor_id) filter (where visit_date >= v_today - 29),
    statement_timestamp()
  from public.website_daily_visitors
  where visit_date >= v_today - 29
  on conflict (metric_date) do update
  set daily_users = excluded.daily_users,
      weekly_users = excluded.weekly_users,
      monthly_users = excluded.monthly_users,
      updated_at = excluded.updated_at;
end;
$$;

comment on function public.record_website_visit(uuid) is
  'Records at most one visit per browser per Manila calendar day and refreshes stored DAU, WAU, and MAU snapshots.';

revoke execute on function public.record_website_visit(uuid) from public, authenticated;
grant execute on function public.record_website_visit(uuid) to anon;

create or replace function public.get_website_traffic_metrics()
returns table (
  daily_users bigint,
  weekly_users bigint,
  monthly_users bigint,
  measured_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  with reporting_date as (
    select timezone('Asia/Manila', statement_timestamp())::date as today
  )
  select
    count(distinct visitor_id) filter (where visit_date = reporting_date.today) as daily_users,
    count(distinct visitor_id) filter (where visit_date >= reporting_date.today - 6) as weekly_users,
    count(distinct visitor_id) filter (where visit_date >= reporting_date.today - 29) as monthly_users,
    statement_timestamp() as measured_at
  from public.website_daily_visitors
  cross join reporting_date
  where visit_date >= reporting_date.today - 29;
$$;

comment on function public.get_website_traffic_metrics() is
  'Returns current DAU, rolling 7-day WAU, and rolling 30-day MAU for the protected admin API.';

revoke execute on function public.get_website_traffic_metrics() from public, anon, authenticated;
grant execute on function public.get_website_traffic_metrics() to service_role;
