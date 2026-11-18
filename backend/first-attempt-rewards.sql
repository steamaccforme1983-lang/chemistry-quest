-- Apply to the existing project after scoring.sql and owner.sql.
-- Transactional and safe to run again. Existing XP is preserved.
begin;
-- Serialize against answer submissions while historical attempts are migrated.
lock table cq_private.accounts in exclusive mode;
do $migration$
declare target regprocedure; definition text;
begin
 target:=coalesce(to_regprocedure('public.cq_account_api_scoring(text,jsonb)'),to_regprocedure('public.cq_account_api(text,jsonb)'));
 if target is null then raise exception 'Install server scoring before this migration';end if;
 definition:=pg_get_functiondef(target);
 if position('firstAttemptRewards' in definition)>0 then return;end if;
 if position($patch0$earned:=correct and not coalesce((s->'results'->qid->>'earned')::boolean,false);$patch0$ in definition)=0 then
  raise exception 'Scoring function does not match expected reward rule 1. No changes applied';
 end if;
 definition:=replace(definition,$patch0$earned:=correct and not coalesce((s->'results'->qid->>'earned')::boolean,false);$patch0$,$patch0$earned:=correct and not (s->'results' ? qid);$patch0$);
 if position($patch1$'earned',earned or coalesce((s->'results'->qid->>'earned')::boolean,false)$patch1$ in definition)=0 then
  raise exception 'Scoring function does not match expected reward rule 2. No changes applied';
 end if;
 definition:=replace(definition,$patch1$'earned',earned or coalesce((s->'results'->qid->>'earned')::boolean,false)$patch1$,$patch1$'earned',earned or coalesce((s->'results'->qid->>'earned')::boolean,false),'solved',correct or coalesce((s->'results'->qid->>'solved')::boolean,false) or coalesce((s->'results'->qid->>'earned')::boolean,false)$patch1$);
 if position($patch2$earned:=correct and not coalesce((s->'challengeEarned'->>qid)::boolean,false);$patch2$ in definition)=0 then
  raise exception 'Scoring function does not match expected reward rule 3. No changes applied';
 end if;
 definition:=replace(definition,$patch2$earned:=correct and not coalesce((s->'challengeEarned'->>qid)::boolean,false);$patch2$,$patch2$earned:=correct and not (coalesce(s->'challengeAttempted','{}'::jsonb) ? qid);$patch2$);
 if position($patch3$if correct then s:=jsonb_set(s,'{challengeEarned}',(s->'challengeEarned')||jsonb_build_object(qid,true));end if;$patch3$ in definition)=0 then
  raise exception 'Scoring function does not match expected reward rule 4. No changes applied';
 end if;
 definition:=replace(definition,$patch3$if correct then s:=jsonb_set(s,'{challengeEarned}',(s->'challengeEarned')||jsonb_build_object(qid,true));end if;$patch3$,$patch3$if correct then s:=jsonb_set(s,'{challengeEarned}',(s->'challengeEarned')||jsonb_build_object(qid,true));end if;
      s:=jsonb_set(s,'{challengeAttempted}',coalesce(s->'challengeAttempted','{}'::jsonb)||jsonb_build_object(qid,true));$patch3$);
 if position($patch4$'serverScoring',true);$patch4$ in definition)=0 then
  raise exception 'Scoring function does not match expected reward rule 5. No changes applied';
 end if;
 definition:=replace(definition,$patch4$'serverScoring',true);$patch4$,$patch4$'serverScoring',true,'firstAttemptRewards',true);$patch4$);
 execute definition;
end; $migration$;

create or replace function cq_private.initial_score(p jsonb) returns jsonb
language sql immutable set search_path='' as $$
 select jsonb_build_object(
 'xp',coalesce(p->'xp','0'::jsonb),'streak',coalesce(p->'streak','0'::jsonb),
 'best',coalesce(p->'best','0'::jsonb),'wrongStreak',coalesce(p->'wrongStreak','0'::jsonb),
 'results',coalesce(p->'results','{}'::jsonb),'activity',coalesce(p->'activity','{}'::jsonb),
 'challengeEarned',coalesce(p->'challengeEarned','{}'::jsonb),
 'challengeAttempted',coalesce(p->'challengeAttempted','{}'::jsonb),
 'challenge',coalesce(p->'challenge','null'::jsonb));
$$;
-- Recover previous challenge attempts from server receipts and the saved challenge.
update cq_private.scoring s set summary=jsonb_set(s.summary,'{challengeAttempted}',
 coalesce(s.summary->'challengeAttempted','{}'::jsonb) || coalesce((
  select jsonb_object_agg(q.id,true) from cq_private.questions q
  where q.kind='challenge' and (
   coalesce((s.summary->'challengeEarned'->>q.id)::boolean,false)
   or s.summary->'challenge'->'answers' ? ((substring(q.id from '^jee-([0-9]+)$')::int-1)::text)
   or exists(select 1 from cq_private.score_events e where e.account_id=s.account_id
    and e.receipt->>'kind'='challenge-answer' and e.receipt->>'id'=q.id)
  )
 ),'{}'::jsonb));

-- Keep the account cache aligned with the protected scoring summary.
update cq_private.accounts a set progress=coalesce(a.progress,'{"version":2}'::jsonb)||s.summary,
 revision=a.revision+1 from cq_private.scoring s where s.account_id=a.id;
commit;
select 'First-attempt-only rewards installed' as result;
