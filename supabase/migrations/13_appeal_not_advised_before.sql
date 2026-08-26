-- 13. Cases where an appeal is premature rather than wrong.
--
-- Meera's closure names a work order with a completion target of 31.08.2026. Our page offered
-- her "Write my appeal" with a days-left counter directly above a next step explaining that an
-- appeal before that date is the appeal an appellate officer dismisses in one line. The page
-- contradicted itself, on a headline demo case, in the direction that costs her the trip.
--
-- So a case may carry the date before which an appeal is not advised. Past that date the
-- column is inert. It never blocks anything: the citizen may still appeal, and if she does,
-- she does it having been told plainly what is likely to happen. Her judgement outranks ours;
-- what she is owed is the information, not the decision.

alter table grievances add column if not exists appeal_not_advised_before timestamptz;

comment on column grievances.appeal_not_advised_before is
  'Advisory only, never a block. A date the department itself stated, before which an appeal is likely to be dismissed as premature.';
