-- Apply after scoring.sql. The existing Edge Function forwards progress requests.
begin;
alter table cq_private.accounts add column if not exists player_code text not null
 default ('CQ-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)));
create unique index if not exists cq_player_code on cq_private.accounts(player_code);

create table if not exists cq_private.battles (
 id uuid primary key default gen_random_uuid(),
 sender uuid not null references cq_private.accounts(id) on delete cascade,
 recipient uuid not null references cq_private.accounts(id) on delete cascade,
 deck text[] not null check (cardinality(deck)=5),
 status text not null default 'pending' check (status in ('pending','accepted','declined','complete','expired')),
 sender_score int check (sender_score between 0 and 5),
 recipient_score int check (recipient_score between 0 and 5),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '7 days',
 check(sender<>recipient)
);
alter table cq_private.battles enable row level security;
revoke all on cq_private.battles from public,anon,authenticated;
grant select,insert,update on cq_private.battles to service_role;
create index if not exists cq_battle_sender on cq_private.battles(sender,created_at desc);
create index if not exists cq_battle_recipient on cq_private.battles(recipient,created_at desc);
create unique index if not exists cq_active_battle_pair
 on cq_private.battles(least(sender,recipient),greatest(sender,recipient))
 where status in ('pending','accepted');

create or replace function cq_private.battle_api(token text, command jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 player cq_private.accounts%rowtype;
 battle cq_private.battles%rowtype;
 opponent uuid;
 action text:=command->>'action';
 answers text:=command->>'answers';
 score int;
begin
 select a.* into player from cq_private.accounts a join cq_private.sessions t on t.account_id=a.id
 where t.token_hash=encode(extensions.digest(coalesce(token,''),'sha256'),'hex') and t.expires_at>now();
 if not found then return jsonb_build_object('error','Please sign in again.','status',401);end if;

 if action='invite' then
  -- Serialize invites from a sender so the daily limit also holds for concurrent requests.
  perform 1 from cq_private.accounts where id=player.id for update;
  select id into opponent from cq_private.accounts where player_code=upper(trim(command->>'code'));
  if opponent is null or opponent=player.id then
   return jsonb_build_object('error','Enter a valid player ID from a different account.','status',400);
  end if;
  if (select count(*) from cq_private.battles where sender=player.id and created_at>now()-interval '1 day')>=15 then
   return jsonb_build_object('error','You’ve reached today’s invite limit. Try again tomorrow.','status',429);
  end if;
  update cq_private.battles set status='expired'
   where least(sender,recipient)=least(player.id,opponent) and greatest(sender,recipient)=greatest(player.id,opponent)
     and expires_at<=now() and status in ('pending','accepted');
  insert into cq_private.battles(sender,recipient,deck)
   values(player.id,opponent,array(select id from cq_private.questions where kind='practice' order by random() limit 5))
   on conflict do nothing;
  if not found then return jsonb_build_object('error','You already have an open battle with this player.','status',409);end if;
 elsif action in ('accept','decline','submit') then
  if coalesce(command->>'id','') !~ '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$' then
   return jsonb_build_object('error','Battle not found.','status',404);
  end if;
  select * into battle from cq_private.battles b
   where b.id=(command->>'id')::uuid and player.id in (b.sender,b.recipient) for update;
  if not found then return jsonb_build_object('error','Battle not found.','status',404);end if;
  if battle.expires_at<=now() and battle.status<>'complete' then
   return jsonb_build_object('error','This battle has expired.','status',409);
  end if;
  if action in ('accept','decline') then
   if player.id<>battle.recipient or battle.status<>'pending' then
    return jsonb_build_object('error','This invitation can no longer be changed.','status',409);
   end if;
   update cq_private.battles set status=case when action='accept' then 'accepted' else 'declined' end where id=battle.id;
  elsif battle.status not in ('accepted','complete') or coalesce(answers,'') !~ '^[0-3]{5}$' then
   return jsonb_build_object('error','Accept the battle and answer all five questions before submitting.','status',400);
  elsif (case when player.id=battle.sender then battle.sender_score else battle.recipient_score end) is null then
   select count(*) into score from unnest(battle.deck) with ordinality as d(qid,position)
    join cq_private.questions q on q.id=d.qid
    where q.answer=substr(answers,d.position::int,1)::int;
   update cq_private.battles set
    sender_score=case when player.id=battle.sender then score else battle.sender_score end,
    recipient_score=case when player.id=battle.recipient then score else battle.recipient_score end,
    status=case when coalesce(battle.sender_score,battle.recipient_score) is null then 'accepted' else 'complete' end
    where id=battle.id;
  end if;
 elsif action is distinct from 'list' then
  return jsonb_build_object('error','Unknown battle action.','status',400);
 end if;

 return jsonb_build_object('playerCode',player.player_code,'battles',coalesce((
  select jsonb_agg(jsonb_build_object(
   'id',b.id,'incoming',b.recipient=player.id,'opponent',coalesce(nullif(left(a.progress->>'displayName',32),''),a.player_code),
   'status',case when b.status in ('pending','accepted') and b.expires_at<=now() then 'expired' else b.status end,
   'deck',case when b.status='accepted' and b.expires_at>now() then b.deck end,
   'submitted',(case when b.sender=player.id then b.sender_score else b.recipient_score end) is not null,
   'yourScore',case when b.status='complete' then case when b.sender=player.id then b.sender_score else b.recipient_score end end,
   'theirScore',case when b.status='complete' then case when b.sender=player.id then b.recipient_score else b.sender_score end end
  ) order by b.created_at desc)
  from (select * from cq_private.battles where player.id in (sender,recipient)
        order by (status in ('accepted','pending') and expires_at>now()) desc,created_at desc limit 50) b
  join cq_private.accounts a on a.id=case when b.sender=player.id then b.recipient else b.sender end
 ),'[]'::jsonb));
end; $$;

do $$ begin
 if to_regprocedure('public.cq_account_api_scoring(text,jsonb)') is null then
  alter function public.cq_account_api(text,jsonb) rename to cq_account_api_scoring;
 end if;
end $$;

create or replace function public.cq_account_api(p_action text,p_args jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if p_action='progress' and p_args->'progress' ? '_battle' then
  return cq_private.battle_api(p_args->>'token',p_args->'progress'->'_battle');
 end if;
 return public.cq_account_api_scoring(p_action,p_args);
end; $$;
revoke all on function public.cq_account_api(text,jsonb),public.cq_account_api_scoring(text,jsonb),cq_private.battle_api(text,jsonb) from public,anon,authenticated;
grant execute on function public.cq_account_api(text,jsonb),public.cq_account_api_scoring(text,jsonb),cq_private.battle_api(text,jsonb) to service_role;
commit;
select 'Friend battles installed.' as result;
