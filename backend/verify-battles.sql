begin;
do $verify$
declare
 alice uuid; bob uuid; outsider uuid; bob_code text; bid text;
 r jsonb; correct text;
begin
 insert into cq_private.accounts(email,password_hash,recovery_hash)
 values('battle-alice-'||gen_random_uuid()||'@example.invalid','test','test') returning id into alice;
 insert into cq_private.accounts(email,password_hash,recovery_hash)
 values('battle-bob-'||gen_random_uuid()||'@example.invalid','test','test') returning id,player_code into bob,bob_code;
 insert into cq_private.accounts(email,password_hash,recovery_hash)
 values('battle-outside-'||gen_random_uuid()||'@example.invalid','test','test') returning id into outsider;
 insert into cq_private.sessions(token_hash,account_id) values
 (encode(extensions.digest('battle-test-alice','sha256'),'hex'),alice),
 (encode(extensions.digest('battle-test-bob','sha256'),'hex'),bob),
 (encode(extensions.digest('battle-test-outside','sha256'),'hex'),outsider);
 r:=public.cq_account_api('progress','{"token":"invalid","progress":{"_battle":{"action":"list"}}}');
 assert (r->>'status')::int=401;
 r:=public.cq_account_api('progress',jsonb_build_object('token','battle-test-alice','progress',jsonb_build_object('_battle',jsonb_build_object('action','invite','code',bob_code))));
 bid:=r->'battles'->0->>'id';
 assert bid is not null and r->'battles'->0->'deck'='null'::jsonb,'Pending invite hides deck';
 r:=cq_private.battle_api('battle-test-outside',jsonb_build_object('action','accept','id',bid));
 assert (r->>'status')::int=404;
 r:=cq_private.battle_api('battle-test-alice',jsonb_build_object('action','accept','id',bid));
 assert (r->>'status')::int=409;
 r:=cq_private.battle_api('battle-test-bob',jsonb_build_object('action','accept','id',bid));
 assert jsonb_array_length(r->'battles'->0->'deck')=5;
 select string_agg(q.answer::text,'' order by d.position) into correct
 from jsonb_array_elements_text(r->'battles'->0->'deck') with ordinality d(id,position)
 join cq_private.questions q on q.id=d.id;
 r:=cq_private.battle_api('battle-test-alice',jsonb_build_object('action','submit','id',bid,'answers',correct));
 assert (r->'battles'->0->>'submitted')::boolean and r->'battles'->0->'yourScore'='null'::jsonb;
 r:=cq_private.battle_api('battle-test-alice',jsonb_build_object('action','submit','id',bid,'answers',translate(correct,'0123','1230')));
 r:=cq_private.battle_api('battle-test-bob',jsonb_build_object('action','submit','id',bid,'answers',translate(correct,'0123','1230')));
 assert r->'battles'->0->>'status'='complete';
 assert (r->'battles'->0->>'yourScore')::int=0 and (r->'battles'->0->>'theirScore')::int=5,'Server score and duplicate protection';
 assert not has_function_privilege('anon','public.cq_account_api(text,jsonb)','execute');
 assert not has_table_privilege('authenticated','cq_private.battles','select');
end $verify$;
rollback;
select 'PASS: authenticated invites, acceptance, private rounds, scoring, duplicate protection and result reveal.' as result;
