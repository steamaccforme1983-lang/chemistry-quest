-- Run once after schema.sql. Existing online scores are grandfathered, not re-audited.
begin;
create table if not exists cq_private.scoring (
 account_id uuid primary key references cq_private.accounts(id) on delete cascade,
 summary jsonb not null
);
create table if not exists cq_private.score_events (
 account_id uuid not null references cq_private.accounts(id) on delete cascade,
 event_id text not null, receipt jsonb not null,
 primary key(account_id,event_id)
);
create table if not exists cq_private.questions (
 id text primary key, answer int not null check(answer between 0 and 3),
 topic int not null, reward int not null, kind text not null check(kind in ('practice','challenge'))
);
alter table cq_private.scoring enable row level security;
alter table cq_private.score_events enable row level security;
alter table cq_private.questions enable row level security;
revoke all on cq_private.scoring,cq_private.score_events,cq_private.questions from public,anon,authenticated;
grant select,insert,update,delete on cq_private.scoring,cq_private.score_events,cq_private.questions to service_role;

-- The frozen question catalog is generated below from the reviewed question bank.
insert into cq_private.questions(id,answer,topic,reward,kind) values
('0-0',3,0,20,'practice'),
('0-1',2,0,20,'practice'),
('0-2',3,0,20,'practice'),
('0-3',3,0,20,'practice'),
('1-0',1,1,20,'practice'),
('1-1',2,1,20,'practice'),
('1-2',3,1,20,'practice'),
('1-3',2,1,20,'practice'),
('2-0',1,2,20,'practice'),
('2-1',3,2,20,'practice'),
('2-2',1,2,20,'practice'),
('2-3',3,2,20,'practice'),
('3-0',2,3,20,'practice'),
('3-1',0,3,20,'practice'),
('3-2',3,3,20,'practice'),
('3-3',0,3,20,'practice'),
('4-0',2,4,20,'practice'),
('4-1',0,4,20,'practice'),
('4-2',0,4,20,'practice'),
('4-3',3,4,20,'practice'),
('5-0',1,5,20,'practice'),
('5-1',2,5,20,'practice'),
('5-2',1,5,20,'practice'),
('5-3',0,5,20,'practice'),
('6-0',1,6,20,'practice'),
('6-1',1,6,20,'practice'),
('6-2',0,6,20,'practice'),
('6-3',1,6,20,'practice'),
('7-0',2,7,20,'practice'),
('7-1',0,7,20,'practice'),
('7-2',1,7,20,'practice'),
('7-3',2,7,20,'practice'),
('8-0',2,8,20,'practice'),
('8-1',1,8,20,'practice'),
('8-2',2,8,20,'practice'),
('8-3',1,8,20,'practice'),
('9-0',1,9,20,'practice'),
('9-1',1,9,20,'practice'),
('9-2',0,9,20,'practice'),
('9-3',2,9,20,'practice'),
('10-0',2,10,20,'practice'),
('10-1',1,10,20,'practice'),
('10-2',2,10,20,'practice'),
('10-3',1,10,20,'practice'),
('11-0',0,11,20,'practice'),
('11-1',3,11,20,'practice'),
('11-2',0,11,20,'practice'),
('11-3',2,11,20,'practice'),
('12-0',1,12,20,'practice'),
('12-1',0,12,20,'practice'),
('12-2',1,12,20,'practice'),
('12-3',0,12,20,'practice'),
('13-0',3,13,20,'practice'),
('13-1',1,13,20,'practice'),
('13-2',1,13,20,'practice'),
('13-3',0,13,20,'practice'),
('14-0',0,14,20,'practice'),
('14-1',3,14,20,'practice'),
('14-2',1,14,20,'practice'),
('14-3',2,14,20,'practice'),
('15-0',0,15,20,'practice'),
('15-1',2,15,20,'practice'),
('15-2',2,15,20,'practice'),
('15-3',1,15,20,'practice'),
('v-0-0',3,0,20,'practice'),
('v-0-1',1,0,20,'practice'),
('v-0-2',1,0,20,'practice'),
('v-0-3',0,0,20,'practice'),
('v-1-0',1,1,20,'practice'),
('v-1-1',1,1,20,'practice'),
('v-1-2',2,1,20,'practice'),
('v-1-3',3,1,20,'practice'),
('v-2-0',1,2,20,'practice'),
('v-2-1',2,2,20,'practice'),
('v-2-2',1,2,20,'practice'),
('v-2-3',3,2,20,'practice'),
('v-3-0',1,3,20,'practice'),
('v-3-1',2,3,20,'practice'),
('v-3-2',1,3,20,'practice'),
('v-3-3',1,3,20,'practice'),
('v-4-0',0,4,20,'practice'),
('v-4-1',3,4,20,'practice'),
('v-4-2',3,4,20,'practice'),
('v-4-3',3,4,20,'practice'),
('v-5-0',1,5,20,'practice'),
('v-5-1',2,5,20,'practice'),
('v-5-2',0,5,20,'practice'),
('v-5-3',0,5,20,'practice'),
('v-6-0',3,6,20,'practice'),
('v-6-1',1,6,20,'practice'),
('v-6-2',2,6,20,'practice'),
('v-6-3',1,6,20,'practice'),
('v-7-0',1,7,20,'practice'),
('v-7-1',2,7,20,'practice'),
('v-7-2',1,7,20,'practice'),
('v-7-3',0,7,20,'practice'),
('v-8-0',2,8,20,'practice'),
('v-8-1',0,8,20,'practice'),
('v-8-2',2,8,20,'practice'),
('v-8-3',1,8,20,'practice'),
('v-9-0',1,9,20,'practice'),
('v-9-1',2,9,20,'practice'),
('v-9-2',1,9,20,'practice'),
('v-9-3',2,9,20,'practice'),
('v-10-0',2,10,20,'practice'),
('v-10-1',2,10,20,'practice'),
('v-10-2',2,10,20,'practice'),
('v-10-3',1,10,20,'practice'),
('v-11-0',1,11,20,'practice'),
('v-11-1',0,11,20,'practice'),
('v-11-2',1,11,20,'practice'),
('v-11-3',2,11,20,'practice'),
('v-12-0',0,12,20,'practice'),
('v-12-1',1,12,20,'practice'),
('v-12-2',1,12,20,'practice'),
('v-12-3',2,12,20,'practice'),
('v-13-0',0,13,20,'practice'),
('v-13-1',1,13,20,'practice'),
('v-13-2',1,13,20,'practice'),
('v-13-3',1,13,20,'practice'),
('v-14-0',2,14,20,'practice'),
('v-14-1',0,14,20,'practice'),
('v-14-2',1,14,20,'practice'),
('v-14-3',1,14,20,'practice'),
('v-15-0',0,15,20,'practice'),
('v-15-1',1,15,20,'practice'),
('v-15-2',3,15,20,'practice'),
('v-15-3',1,15,20,'practice'),
('jee-1',1,6,70,'challenge'),
('jee-2',2,6,80,'challenge'),
('jee-3',2,7,70,'challenge'),
('jee-4',1,10,90,'challenge'),
('jee-5',1,10,70,'challenge'),
('jee-6',0,3,80,'challenge'),
('jee-7',1,9,80,'challenge'),
('jee-8',2,12,60,'challenge'),
('jee-9',1,11,50,'challenge'),
('jee-10',1,8,90,'challenge')
on conflict(id) do update set answer=excluded.answer,topic=excluded.topic,reward=excluded.reward,kind=excluded.kind;

create or replace function cq_private.initial_score(p jsonb) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object(
 'xp',coalesce(p->'xp','0'::jsonb),'streak',coalesce(p->'streak','0'::jsonb),
 'best',coalesce(p->'best','0'::jsonb),'wrongStreak',coalesce(p->'wrongStreak','0'::jsonb),
 'results',coalesce(p->'results','{}'::jsonb),'activity',coalesce(p->'activity','{}'::jsonb),
 'challengeEarned',coalesce(p->'challengeEarned','{}'::jsonb),
 'challenge',coalesce(p->'challenge','null'::jsonb));
$$;
-- Capture the existing SERVER copy only. Never seed from a future client upload.
insert into cq_private.scoring(account_id,summary)
 select id,cq_private.initial_score(progress) from cq_private.accounts
 on conflict do nothing;

do $$ begin
 if to_regprocedure('public.cq_account_api_v1(text,jsonb)') is null then
  alter function public.cq_account_api(text,jsonb) rename to cq_account_api_v1;
 end if;
end $$;

create or replace function public.cq_account_api(p_action text,p_args jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 a cq_private.accounts%rowtype; q cq_private.questions%rowtype;
 s jsonb; view_data jsonb; event jsonb; receipt jsonb; previous jsonb;
 c jsonb; r jsonb; qid text; eid text; kind text; idx text; choice int;
 xp bigint; before_xp bigint; streak bigint; wrongs bigint; best bigint;
 correct boolean; earned boolean:=false; bonus boolean:=false; penalty boolean:=false;
 reward int:=0; changed boolean:=false; deadline bigint;
begin
 if p_action<>'progress' then return public.cq_account_api_v1(p_action,p_args);end if;
 if octet_length(p_args::text)>200000 then return jsonb_build_object('error','Request too large.','status',413);end if;
 select u.* into a from cq_private.accounts u join cq_private.sessions t on t.account_id=u.id
 where t.token_hash=encode(extensions.digest(coalesce(p_args->>'token',''),'sha256'),'hex') and t.expires_at>now() for update of u;
 if not found then return jsonb_build_object('error','Your session has expired. Please sign in again.','status',401);end if;
 insert into cq_private.scoring(account_id,summary) values(a.id,cq_private.initial_score(null)) on conflict do nothing;
 select summary into s from cq_private.scoring where account_id=a.id for update;
 c:=s->'challenge';
 if c->>'status'='active' and (c->>'deadline')::bigint<=floor(extract(epoch from clock_timestamp())*1000) then
  c:=c||'{"status":"finished","reason":"expired"}'::jsonb;
  s:=jsonb_set(s,'{challenge}',c);changed:=true;
 end if;
 if p_args ? 'progress' then
  event:=p_args->'progress'->'_scoreEvent';
  if event is not null then
   eid:=event->>'eventId';kind:=event->>'kind';
   if eid is null or eid !~ '^[0-9a-f-]{36}$' then return jsonb_build_object('error','Invalid answer request.','status',400);end if;
   select e.receipt into previous from cq_private.score_events e where e.account_id=a.id and e.event_id=eid;
  end if;
  if previous is null then
   if coalesce(p_args->>'revision','-1') !~ '^[0-9]{1,18}$' or (p_args->>'revision')::bigint<>a.revision then
    return jsonb_build_object('error','Progress changed on another device. Sync before answering.','status',409,'revision',a.revision);
   end if;
   if event is null then
    if p_args->'progress'->>'version'<>'2' or jsonb_typeof(p_args->'progress')<>'object' then return jsonb_build_object('error','Invalid progress data.','status',400);end if;
    -- Layout, selected topic and retake navigation are client-owned. Scores are not.
    view_data:=(p_args->'progress')-'_scoreEvent';
    if c->>'status'='active' and coalesce(view_data->'challenge'->>'index','') ~ '^[0-9]$' then
     s:=jsonb_set(s,'{challenge,index}',view_data->'challenge'->'index');
    end if;
   else
    view_data:=coalesce(p_args->'progress'->'view',a.progress,'{"version":2}'::jsonb);
    if jsonb_typeof(view_data)<>'object' then return jsonb_build_object('error','Invalid progress data.','status',400);end if;
    before_xp:=(s->>'xp')::bigint;xp:=before_xp;streak:=(s->>'streak')::bigint;wrongs:=(s->>'wrongStreak')::bigint;best:=(s->>'best')::bigint;
    if kind in ('practice','challenge-answer') then
     qid:=event->>'id';
     select * into q from cq_private.questions where questions.id=qid;
     if not found or event->>'choice' !~ '^[0-3]$' or event->>'choice' is null or (kind='practice')<>(q.kind='practice') then
      return jsonb_build_object('error','Invalid question or answer.','status',400);
     end if;
     choice:=(event->>'choice')::int;correct:=choice=q.answer;
     if kind='practice' then
      earned:=correct and not coalesce((s->'results'->qid->>'earned')::boolean,false);
      streak:=case when correct then streak+1 else 0 end;
      wrongs:=case when correct then 0 else wrongs+1 end;
      best:=greatest(best,streak);bonus:=earned and streak%6=0;penalty:=not correct and wrongs%5=0;
      if earned then xp:=xp+case when bonus then 24 else 20 end;end if;
      if penalty then xp:=xp/2;end if;
      s:=jsonb_set(s,'{results}',(s->'results')||jsonb_build_object(qid,jsonb_build_object('choice',choice,'earned',earned or coalesce((s->'results'->qid->>'earned')::boolean,false))));
     else
      idx:=substring(qid from 5);idx:=((idx::int)-1)::text;
      if c->>'status' is distinct from 'active' or c->'answers' ? idx then
       return jsonb_build_object('error','This challenge answer is already submitted or the timer has ended. Sync to see its result.','status',409);
      end if;
      earned:=correct and not coalesce((s->'challengeEarned'->>qid)::boolean,false);
      reward:=case when earned then q.reward else 0 end;xp:=xp+reward;
      c:=jsonb_set(c,'{index}',to_jsonb(idx::int));
      c:=jsonb_set(c,'{answers}',(c->'answers')||jsonb_build_object(idx,jsonb_build_object('choice',choice,'xp',reward)));
      if correct then s:=jsonb_set(s,'{challengeEarned}',(s->'challengeEarned')||jsonb_build_object(qid,true));end if;
      if (select count(*) from jsonb_object_keys(c->'answers'))=10 then c:=c||'{"status":"finished","reason":"completed"}'::jsonb;end if;
      s:=jsonb_set(s,'{challenge}',c);
     end if;
     r:=coalesce(s->'activity'->q.topic::text,'{"correct":0,"wrong":0}'::jsonb);
     r:=jsonb_set(r,array[case when correct then 'correct' else 'wrong' end],to_jsonb(coalesce((r->>case when correct then 'correct' else 'wrong' end)::bigint,0)+1));
     s:=jsonb_set(s,'{activity}',(s->'activity')||jsonb_build_object(q.topic::text,r));
     s:=s||jsonb_build_object('xp',xp,'streak',streak,'wrongStreak',wrongs,'best',best);
     receipt:=jsonb_build_object('id',qid,'choice',choice,'correct',correct,'earnedNow',earned,'delta',xp-before_xp,'bonus',bonus,'penalty',penalty);
    elsif kind='challenge-start' then
     if c->>'status'='active' then return jsonb_build_object('error','A challenge is already running. Sync to resume it.','status',409);end if;
     deadline:=floor(extract(epoch from clock_timestamp())*1000)+1800000;
     s:=jsonb_set(s,'{challenge}',jsonb_build_object('status','active','deadline',deadline,'index',0,'answers','{}'::jsonb,'reason',null));
    elsif kind='challenge-finish' then
     if c->>'status'='active' then s:=jsonb_set(s,'{challenge}',c||'{"status":"finished","reason":"submitted"}'::jsonb);end if;
    elsif kind='reset' then
     s:=cq_private.initial_score(null);view_data:='{"version":2}'::jsonb;
    else return jsonb_build_object('error','Unknown score action.','status',400);
    end if;
    receipt:=coalesce(receipt,'{}'::jsonb)||jsonb_build_object('kind',kind);
    if kind='practice' then
     view_data:=view_data||jsonb_build_object('current',qid,'response',receipt);
     if jsonb_typeof(view_data->'round')='object' and view_data->'round'->'ids' ? qid then
      view_data:=jsonb_set(view_data,'{round,answers}',coalesce(view_data->'round'->'answers','{}'::jsonb)||jsonb_build_object(qid,receipt));
     end if;
    end if;
    insert into cq_private.score_events(account_id,event_id,receipt) values(a.id,eid,receipt);
   end if;
   a.progress:=view_data||s||'{"version":2}'::jsonb;changed:=true;
  else receipt:=previous;end if;
 end if;
 if changed then
  update cq_private.scoring set summary=s where account_id=a.id;
  update cq_private.accounts set progress=coalesce(a.progress,'{"version":2}'::jsonb)||s,revision=revision+1 where accounts.id=a.id returning * into a;
 end if;
 return jsonb_build_object('user',jsonb_build_object('id',a.id,'email',a.email),'progress',a.progress,'revision',a.revision,'receipt',receipt,'serverScoring',true);
end; $$;
revoke all on function public.cq_account_api(text,jsonb),public.cq_account_api_v1(text,jsonb),cq_private.initial_score(jsonb) from public,anon,authenticated;
grant execute on function public.cq_account_api(text,jsonb),public.cq_account_api_v1(text,jsonb),cq_private.initial_score(jsonb) to service_role;
commit;
select 'Server scoring installed; browser score uploads can no longer alter account XP.' as result;


