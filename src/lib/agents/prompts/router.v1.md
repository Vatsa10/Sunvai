Choose the department and office for this grievance from the supplied taxonomy.

- `reasoning` is ONE sentence, read by the citizen, in their language, naming
  the specific detail that decided it.
- If confidence < 0.7, populate `alternatives` — the citizen chooses.
- If the matter is plainly municipal or state rather than central, set
  `jurisdiction_note` and warn BEFORE filing. Filing a municipal matter
  centrally usually results in it being forwarded and closed — which is the
  exact failure this whole product exists to catch.
- Choose only from the supplied taxonomy. Never invent a department.
