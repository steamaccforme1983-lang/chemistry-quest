create extension if not exists pgcrypto with schema extensions;
create schema if not exists cq_private;
revoke all on schema cq_private from public, anon, authenticated;
grant usage on schema cq_private to service_role;
create table cq_private.accounts (
 id uuid primary key default gen_random_uuid(), email text not null unique,
 password_hash text not null, recovery_hash text not null,
 progress jsonb, revision bigint not null default 0,
 created_at timestamptz not null default now()
);
create table cq_private.sessions (
 token_hash text primary key, account_id uuid not null references cq_private.accounts(id) on delete cascade,
 expires_at timestamptz not null default now()+interval '7 days'
);
create index on cq_private.sessions(account_id);
create table cq_private.login_limits (
 key text primary key, failures int not null default 0, stage int not null default 0,
 blocked_until timestamptz not null default '-infinity'
);
create table cq_private.request_limits (
 key text primary key, window_start timestamptz not null, count int not null
);
alter table cq_private.accounts enable row level security;
alter table cq_private.sessions enable row level security;
alter table cq_private.login_limits enable row level security;
alter table cq_private.request_limits enable row level security;
revoke all on all tables in schema cq_private from public, anon, authenticated;
grant select,insert,update,delete on all tables in schema cq_private to service_role;

-- Invoker privileges only. The sole caller is the server's service role.
create or replace function public.cq_account_api(p_action text,p_args jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 a cq_private.accounts%rowtype; lim cq_private.login_limits%rowtype;
 mail text:=lower(trim(coalesce(p_args->>'email','')));
 pw text:=coalesce(p_args->>'password',''); recovery text:=coalesce(p_args->>'recovery','');
 tok text:=coalesce(p_args->>'token',''); newtok text:=coalesce(p_args->>'newToken','');
 lockkey text; n int; wait_seconds int; blocked timestamptz; known boolean; correct boolean;
begin
 if octet_length(p_args::text)>200000 then return jsonb_build_object('error','Request too large.','status',413);end if;
 if p_action='throttle' then
  insert into cq_private.request_limits as r(key,window_start,count)
   values(p_args->>'key',date_trunc('minute',now()),1)
   on conflict(key) do update set count=case when r.window_start=date_trunc('minute',now()) then r.count+1 else 1 end,window_start=date_trunc('minute',now()) returning count into n;
  return jsonb_build_object('allowed',n<=60);
 end if;
 if p_action in ('signup','login','recover') then
  if length(mail)>254 or mail !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then return jsonb_build_object('error','Enter a valid email address.','status',400);end if;
  if octet_length(pw)>72 or (p_action<>'login' and length(pw)<12) or length(pw)=0 then return jsonb_build_object('error','Use a password of at least 12 characters and at most 72 bytes.','status',400);end if;
  if length(newtok)<40 then return jsonb_build_object('error','Invalid session.','status',400);end if;
  if p_action='signup' then
   if length(recovery)<30 then return jsonb_build_object('error','Invalid recovery code.','status',400);end if;
   insert into cq_private.accounts(email,password_hash,recovery_hash)
    values(mail,extensions.crypt(pw,extensions.gen_salt('bf',10)),encode(extensions.digest(recovery,'sha256'),'hex'))
    on conflict(email) do nothing returning * into a;
   if a.id is null then return jsonb_build_object('error','Unable to create this account. Try signing in or recovering it.','status',400);end if;
  else
   lockkey:=p_action||':'||encode(extensions.digest(mail,'sha256'),'hex');
   insert into cq_private.login_limits(key) values(lockkey) on conflict do nothing;
   select * into lim from cq_private.login_limits where key=lockkey for update;
   if lim.blocked_until>now() then return jsonb_build_object('error','Too many unsuccessful attempts. Please wait.','status',429,'retryAfter',ceil(extract(epoch from lim.blocked_until-now())));end if;
   select * into a from cq_private.accounts where email=mail for update;
   known:=found;
   if p_action='login' then
    if known then correct:=extensions.crypt(pw,a.password_hash)=a.password_hash;
    else perform extensions.crypt(pw,extensions.gen_salt('bf',10));correct:=false;end if;
   else correct:=known and encode(extensions.digest(recovery,'sha256'),'hex')=a.recovery_hash;
   end if;
   if not coalesce(correct,false) then
    n:=lim.failures+1;
    if n>=3 then
     wait_seconds:=least(86400,300*power(4,least(lim.stage,5)))::int;
     blocked:=now()+make_interval(secs=>wait_seconds);
     update cq_private.login_limits set failures=0,stage=least(stage+1,6),blocked_until=blocked where key=lockkey;
     return jsonb_build_object('error','Too many unsuccessful attempts. Please wait.','status',429,'retryAfter',wait_seconds);
    end if;
    update cq_private.login_limits set failures=n where key=lockkey;
    return jsonb_build_object('error',case when p_action='recover' then 'Email or recovery code is incorrect.' else 'Email or password is incorrect.' end,'status',401,'attemptsLeft',3-n);
   end if;
   update cq_private.login_limits set failures=0,stage=0,blocked_until='-infinity' where key=lockkey;
   if p_action='recover' then
    if length(p_args->>'newRecovery')<30 then return jsonb_build_object('error','Invalid recovery code.','status',400);end if;
    update cq_private.accounts set password_hash=extensions.crypt(pw,extensions.gen_salt('bf',10)),recovery_hash=encode(extensions.digest(p_args->>'newRecovery','sha256'),'hex') where id=a.id;
    delete from cq_private.sessions where account_id=a.id;
    delete from cq_private.login_limits where key='login:'||encode(extensions.digest(mail,'sha256'),'hex');
   end if;
  end if;
  insert into cq_private.sessions(token_hash,account_id) values(encode(extensions.digest(newtok,'sha256'),'hex'),a.id);
  return jsonb_build_object('user',jsonb_build_object('id',a.id,'email',a.email),'progress',a.progress,'revision',a.revision);
 end if;
 if length(tok)<40 then return jsonb_build_object('error','Please sign in again.','status',401);end if;
 select u.* into a from cq_private.accounts u join cq_private.sessions s on s.account_id=u.id
  where s.token_hash=encode(extensions.digest(tok,'sha256'),'hex') and s.expires_at>now() for update of u;
 if not found then return jsonb_build_object('error','Your session has expired. Please sign in again.','status',401);end if;
 if p_action='logout' then
  delete from cq_private.sessions where token_hash=encode(extensions.digest(tok,'sha256'),'hex');
  return jsonb_build_object('ok',true);
 elsif p_action='progress' then
  if p_args ? 'progress' then
   if jsonb_typeof(p_args->'progress')<>'object' or p_args->'progress'->>'version'<>'2' then return jsonb_build_object('error','Invalid progress data.','status',400);end if;
   if coalesce((p_args->>'revision')::bigint,-1)<>a.revision then return jsonb_build_object('error','Progress changed on another device.','status',409,'revision',a.revision);end if;
   update cq_private.accounts set progress=p_args->'progress',revision=revision+1 where id=a.id returning * into a;
  end if;
  return jsonb_build_object('user',jsonb_build_object('id',a.id,'email',a.email),'progress',a.progress,'revision',a.revision);
 end if;
 return jsonb_build_object('error','Unknown action.','status',400);
end; $$;
revoke all on function public.cq_account_api(text,jsonb) from public,anon,authenticated;
grant execute on function public.cq_account_api(text,jsonb) to service_role;

select tablename,rowsecurity from pg_tables where schemaname='cq_private';
