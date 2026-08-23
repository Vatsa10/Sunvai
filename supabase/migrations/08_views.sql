-- 8. The public numbers.
-- true_resolution_rate is computed from confirmations — the citizen's own yes/no — and never
-- from audits. Once departments know a model reads their replies, some will write for the
-- model; the metric has to sit somewhere a model cannot reach.

create or replace view true_resolution_rate as
select
  o.id   as office_id,
  o.name as office_name,
  d.short_name as department,
  o.state,
  o.lat, o.lon,
  count(*) filter (where g.status in ('closed','appeal_closed'))  as disposed,
  count(*) filter (where c.resolved is true)                      as citizen_confirmed_resolved,
  count(*) filter (where c.id is not null)                        as citizens_asked,
  round(100.0 * count(*) filter (where c.resolved is true)
        / nullif(count(*) filter (where c.id is not null), 0), 1) as true_resolution_pct
from grievances g
join offices o     on o.id = g.office_id
join departments d on d.id = o.department_id
left join confirmations c on c.grievance_id = g.id and c.supersedes_id is null
group by o.id, o.name, d.short_name, o.state, o.lat, o.lon;

-- Our own error rate, both directions, published beside the resolution rate.
create or replace view our_error_rate as
select
  count(*) filter (where a.verdict = 'resolved' and c.resolved = false)          as too_soft,
  count(*) filter (where a.verdict in ('deflected','boilerplate','non_responsive')
                     and c.resolved = true)                                      as too_harsh,
  count(*)                                                                       as total_compared
from audits a
join confirmations c on c.grievance_id = a.grievance_id and c.supersedes_id is null;

-- Headline: disposal vs true resolution, nationally.
create or replace view headline_numbers as
select
  count(*) filter (where g.status in ('closed','appeal_closed'))                  as disposed,
  count(*)                                                                        as total,
  round(100.0 * count(*) filter (where g.status in ('closed','appeal_closed'))
        / nullif(count(*), 0), 1)                                                 as disposal_pct,
  count(*) filter (where c.id is not null)                                        as citizens_asked,
  count(*) filter (where c.resolved is true)                                      as confirmed_resolved,
  round(100.0 * count(*) filter (where c.resolved is true)
        / nullif(count(*) filter (where c.id is not null), 0), 1)                 as true_resolution_pct
from grievances g
left join confirmations c on c.grievance_id = g.id and c.supersedes_id is null;
