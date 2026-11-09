-- Apply after battles.sql. Set cq.owner_player_code locally in this transaction to bind the first owner.
begin;
create table if not exists cq_private.app_owner (
 singleton boolean primary key default true check(singleton),
 account_id uuid not null references cq_private.accounts(id) on delete cascade
);
create table if not exists cq_private.issue_reports (
 account_id uuid not null references cq_private.accounts(id) on delete cascade,
 category text not null check(category in ('account','practice','battle','other')),
 report_day date not null default (now() at time zone 'UTC')::date,
 primary key(account_id,category,report_day)
);
alter table cq_private.app_owner enable row level security;
alter table cq_private.issue_reports enable row level security;
revoke all on cq_private.app_owner,cq_private.issue_reports from public,anon,authenticated;
grant select on cq_private.app_owner to service_role;
grant select,insert on cq_private.issue_reports to service_role;

do $owner$
declare requested_code text:=current_setting('cq.owner_player_code',true); owner_id uuid;
begin
 if coalesce(requested_code,'')='' then return;end if;
 select a.id into owner_id from cq_private.accounts a where a.player_code=upper(trim(requested_code));
 if owner_id is null then raise exception 'Owner player ID was not found';end if;
 insert into cq_private.app_owner(account_id) values(owner_id) on conflict(singleton) do nothing;
 if not exists(select 1 from cq_private.app_owner where account_id=owner_id) then
  raise exception 'An owner is already registered';
 end if;
end $owner$;

create or replace function cq_private.owner_api(token text, command jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 account uuid;
 category text:=command->>'category';
begin
 select t.account_id into account from cq_private.sessions t
 where t.token_hash=encode(extensions.digest(coalesce(token,''),'sha256'),'hex') and t.expires_at>now();
 if not found then return jsonb_build_object('error','Please sign in again.','status',401);end if;
 if command->>'action'='report' then
  if category is null or category not in ('account','practice','battle','other') then
   return jsonb_build_object('error','Choose an issue category.','status',400);
  end if;
  insert into cq_private.issue_reports(account_id,category) values(account,category) on conflict do nothing;
  return jsonb_build_object('reported',true);
 end if;
 if not exists(select 1 from cq_private.app_owner o where o.account_id=account) then
  return jsonb_build_object('error','Owner access required.','status',403);
 end if;
 if command->>'action' is distinct from 'dashboard' then
  return jsonb_build_object('error','Unknown dashboard action.','status',400);
 end if;
 return jsonb_build_object(
  'players',(select count(*) from cq_private.accounts),
  'battles',(select count(*) from cq_private.battles),
  'completed',(select count(*) from cq_private.battles where status='complete'),
  'open',(select count(*) from cq_private.battles where status in ('pending','accepted') and expires_at>now()),
  'reports',coalesce((select jsonb_object_agg(r.category,r.total) from
   (select i.category,count(*) total from cq_private.issue_reports i group by i.category) r),'{}'::jsonb)
 );
end; $$;

create or replace function public.cq_account_api(p_action text,p_args jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if p_action='progress' and p_args->'progress' ? '_owner' then
  return cq_private.owner_api(p_args->>'token',p_args->'progress'->'_owner');
 end if;
 if p_action='progress' and p_args->'progress' ? '_battle' then
  return cq_private.battle_api(p_args->>'token',p_args->'progress'->'_battle');
 end if;
 result:=public.cq_account_api_scoring(p_action,p_args);
 if result->'user'->>'id' is not null then
  result:=result||jsonb_build_object('appOwner',exists(
   select 1 from cq_private.app_owner where account_id=(result->'user'->>'id')::uuid));
 end if;
 return result;
end; $$;
revoke all on function public.cq_account_api(text,jsonb),cq_private.owner_api(text,jsonb) from public,anon,authenticated;
grant execute on function public.cq_account_api(text,jsonb),cq_private.owner_api(text,jsonb) to service_role;
commit;
select 'Owner dashboard installed' as result;
