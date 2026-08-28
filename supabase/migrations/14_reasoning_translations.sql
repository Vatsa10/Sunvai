-- 14. The verdict's explanation, in the citizen's language, kept.
--
-- Migration 12/13's pass translated the auditor's reasoning at render. It was the right
-- sentence and the wrong place: a cold page paid fourteen seconds for a model call before it
-- rendered anything, and an in-memory cache dies with the instance, so every new instance paid
-- it again. On the headline demo case that is a fifteen-second blank screen on a judge's first
-- click.
--
-- The translation belongs beside the thing it translates. An audit row is immutable once
-- written, so a translation of its reasoning is a fact about that row and can be stored on it:
-- one map, language code to translated text. Written through once, on the first render that
-- needs it, and pre-warmed for the demo cases at seed time so the first click is never the one
-- that pays.
--
-- This is a cache of OUR sentence. The department's reply is never translated in place — the
-- citation guard matches that exact text — and the auditor's own `reasoning` column is never
-- overwritten.

alter table audits add column if not exists reasoning_translations jsonb not null default '{}'::jsonb;

comment on column audits.reasoning_translations is
  'lang code -> our translation of reasoning. A cache, not evidence. reasoning itself is never rewritten.';
