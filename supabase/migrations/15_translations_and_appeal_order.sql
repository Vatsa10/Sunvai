-- 15. Two things a citizen-facing page cannot be wrong about: language, and which appeal.
--
-- (a) Translations, generalised. Migration 14 stored the auditor's reasoning per language on
--     the audit row. Two more pieces of text on the case page have exactly the same problem —
--     the "what they did not answer" list, which is the list a citizen carries to a counter,
--     and the next step, which is stored once in the case's own language and so renders
--     Marathi at a Hindi reader and English at a Marathi one. Same shape, same columns, one
--     mechanism: lang code -> the translated parts, as a json array so a list and a
--     heading/body pair fit the same store.
--
--     `reasoning_translations` moves from lang -> text to lang -> [text] for the same reason.
--     Existing values are converted rather than dropped.
--
-- (b) `appeals` had no creation time. `getCase` ordered by `id desc`, and `id` is a uuid: that
--     ordering is arbitrary, so the consent gate and the send action could each read a
--     different row, and a case holding two appeals showed whichever uuid sorted highest. A
--     `created_at` is the honest fix — the question "which appeal is the current one" is a
--     question about time, and the table could not answer it. A cleverer coalesce over
--     consented_at/sent_at would still have nothing to say about two drafts.
--
--     And two live drafts is itself the defect, not just a display problem: drafting is meant
--     to happen once per intent. The partial unique index makes that structural.

alter table audits     add column if not exists unaddressed_translations jsonb not null default '{}'::jsonb;
alter table grievances add column if not exists next_step_translations   jsonb not null default '{}'::jsonb;

comment on column audits.unaddressed_translations is
  'lang code -> our translation of `unaddressed`, as a json array in the same order. A cache, not evidence.';
comment on column grievances.next_step_translations is
  'lang code -> [heading, body], our translation of the seeded next step. A cache, not evidence.';

-- lang -> text  becomes  lang -> [text]
update audits
   set reasoning_translations = (
         select coalesce(jsonb_object_agg(k, jsonb_build_array(v)), '{}'::jsonb)
           from jsonb_each_text(reasoning_translations) as e(k, v))
 where reasoning_translations <> '{}'::jsonb
   and jsonb_typeof(reasoning_translations -> (select k from jsonb_object_keys(reasoning_translations) k limit 1)) = 'string';

alter table appeals add column if not exists created_at timestamptz not null default now();

-- Older rows have no creation time of their own; the best available answer is when they were
-- consented or sent, and failing that, leave the default.
update appeals set created_at = coalesce(consented_at, sent_at, created_at);

-- Collapse any pre-existing duplicate drafts down to the newest before the index goes on.
delete from appeals a
 using appeals b
 where a.grievance_id = b.grievance_id
   and a.status = 'drafted' and b.status = 'drafted'
   and (b.created_at, b.id) > (a.created_at, a.id);

create unique index if not exists appeals_one_drafted_per_grievance
  on appeals (grievance_id) where status = 'drafted';
