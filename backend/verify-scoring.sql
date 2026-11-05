begin;
do $test$
declare uid uuid; tok text:=repeat('c',64); r jsonb; rev bigint:=0; balance bigint; q record; n int:=0;
begin
 insert into cq_private.accounts(email,password_hash,recovery_hash) values('scoring-rollback@example.invalid','test-only','test-only') returning id into uid;
 insert into cq_private.sessions(token_hash,account_id) values(encode(extensions.digest(tok,'sha256'),'hex'),uid);
 r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',rev,'progress','{"version":2,"xp":999999,"streak":99,"results":{"p-1":{"earned":true}},"challengeEarned":{"jee-1":true}}'::jsonb));
 assert (r->'progress'->>'xp')::int=0,'Forged XP must be ignored';
 assert (r->'progress'->>'streak')::int=0,'Forged streak must be ignored';
 assert r->'progress'->'results'='{}'::jsonb,'Forged earned markers must be ignored';
 rev:=(r->>'revision')::bigint;
 for q in select * from cq_private.questions where kind='practice' order by id limit 6 loop
  n:=n+1;
  r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',rev,'progress',jsonb_build_object('_scoreEvent',jsonb_build_object('eventId',lpad(n::text,36,'0'),'kind','practice','id',q.id,'choice',q.answer))));
  assert not r ? 'error','Valid answers must succeed';rev:=(r->>'revision')::bigint;
 end loop;
 assert (r->'progress'->>'xp')::int=124,'Six correct answers must earn 124 XP';
 r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',0,'progress',jsonb_build_object('_scoreEvent',jsonb_build_object('eventId',lpad('6',36,'0'),'kind','practice','id',q.id,'choice',q.answer))));
 assert (r->'progress'->>'xp')::int=124,'Retried event must not award twice';
 for n in 7..11 loop
  r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',rev,'progress',jsonb_build_object('_scoreEvent',jsonb_build_object('eventId',lpad(n::text,36,'0'),'kind','practice','id',q.id,'choice',(q.answer+1)%4))));
  assert not r ? 'error','Wrong answer must be graded';rev:=(r->>'revision')::bigint;
 end loop;
 assert (r->'progress'->>'xp')::int=62,'Five wrong answers must halve XP';
 r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',rev,'progress',jsonb_build_object('_scoreEvent',jsonb_build_object('eventId',lpad('12',36,'0'),'kind','challenge-start'),'view','{"version":2,"challenge":{"deadline":9999999999999}}'::jsonb)));
 assert not r ? 'error','Challenge must start';rev:=(r->>'revision')::bigint;
 assert (r->'progress'->'challenge'->>'deadline')::bigint<floor(extract(epoch from now())*1000)+1801000,'Deadline must be server-owned';
 r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',rev,'progress','{"version":2,"xp":999999,"challenge":{"status":"finished","deadline":9999999999999}}'::jsonb));
 assert (r->'progress'->>'xp')::int=62,'Later forged upload cannot change XP';
 assert r->'progress'->'challenge'->>'status'='active','Client cannot finish or alter challenge';rev:=(r->>'revision')::bigint;
 select * into q from cq_private.questions where id='jee-1';
 r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',rev,'progress',jsonb_build_object('_scoreEvent',jsonb_build_object('eventId',lpad('13',36,'0'),'kind','challenge-answer','id',q.id,'choice',q.answer))));
 assert (r->'progress'->>'xp')::int=132,'Challenge award must come from catalog';rev:=(r->>'revision')::bigint;
 update cq_private.scoring set summary=jsonb_set(summary,'{challenge,deadline}','0'::jsonb) where account_id=uid;
 r:=public.cq_account_api('progress',jsonb_build_object('token',tok));
 assert r->'progress'->'challenge'->>'reason'='expired','Server must expire challenge';rev:=(r->>'revision')::bigint;
 r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',rev,'progress',jsonb_build_object('_scoreEvent',jsonb_build_object('eventId',lpad('14',36,'0'),'kind','challenge-answer','id','jee-2','choice',2))));
 assert (r->>'status')::int=409,'Late challenge answer must be rejected';
 r:=public.cq_account_api('progress',jsonb_build_object('token',tok,'revision',rev,'progress',jsonb_build_object('_scoreEvent',jsonb_build_object('eventId',lpad('15',36,'0'),'kind','reset'))));
 assert (r->'progress'->>'xp')::int=0,'Explicit reset must work';
 assert not has_table_privilege('anon','cq_private.scoring','update'),'Browser must not edit scoring tables';
 assert not has_function_privilege('anon','public.cq_account_api_v1(text,jsonb)','execute'),'Legacy writer must stay private';
end $test$;
rollback;
select 'PASS: forged XP/streak/rewards ignored, server grading, streak bonus, penalty, event retry, challenge rewards/deadlines/expiry, explicit reset and private access. Test data rolled back.' as result;
