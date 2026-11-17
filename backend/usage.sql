-- Apply after owner.sql. Uses the existing account endpoint and preserves owner privileges.
begin;

create table if not exists cq_private.live_usage (
 browser_id uuid primary key,
 account_id uuid references cq_private.accounts(id) on delete cascade,
 seen_at timestamptz not null default now()
);
create index if not exists cq_live_usage_seen_at on cq_private.live_usage(seen_at);
alter table cq_private.live_usage enable row level security;
revoke all on cq_private.live_usage from public, anon, authenticated;
grant select, insert, update, delete on cq_private.live_usage to service_role;

-- Keep the current router, including its badge and dashboard behavior.
do $migration$
begin
 if to_regprocedure('public.cq_account_api_before_usage(text,jsonb)') is null then
  alter function public.cq_account_api(text,jsonb) rename to cq_account_api_before_usage;
 end if;
end $migration$;

create or replace function public.cq_account_api(p_action text,p_args jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 browser text:=p_args->'progress'->>'_presence';
 player uuid;
 result jsonb;
 active_players bigint;
 active_guests bigint;
begin
 if p_action='progress' and p_args->'progress' ? '_presence' then
  if browser is null or browser !~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$' then
   return jsonb_build_object('error','Invalid browser identifier.','status',400);
  end if;
  select account_id into player from cq_private.sessions
   where token_hash=encode(extensions.digest(coalesce(p_args->>'token',''),'sha256'),'hex')
    and expires_at>now();
  insert into cq_private.live_usage(browser_id,account_id)
   values(browser::uuid,player)
   on conflict(browser_id) do update set account_id=excluded.account_id,seen_at=excluded.seen_at;
  -- Remove expired entries during visits so this is a rolling count rather than a usage history.
  delete from cq_private.live_usage where seen_at<now()-interval '10 minutes';
  return jsonb_build_object('tracked',true);
 end if;

 result:=public.cq_account_api_before_usage(p_action,p_args);
 if p_action='progress' and p_args->'progress'->'_owner'->>'action'='dashboard'
    and result ? 'players' and not (result ? 'error') then
  select count(distinct account_id), count(*) filter (where account_id is null)
   into active_players,active_guests from cq_private.live_usage
   where seen_at>now()-interval '2 minutes';
  result:=result||jsonb_build_object('usage',jsonb_build_object(
   'active',active_players+active_guests,'signedIn',active_players,'guests',active_guests
  ));
 end if;
 return result;
end; $$;

revoke all on function public.cq_account_api(text,jsonb),public.cq_account_api_before_usage(text,jsonb) from public,anon,authenticated;
grant execute on function public.cq_account_api(text,jsonb),public.cq_account_api_before_usage(text,jsonb) to service_role;
commit;
