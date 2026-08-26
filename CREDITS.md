# Credits

## The on-device case list

Sunvai's premise is that the citizen comes back weeks later, after a department has closed
their grievance. While looking at other work in this space we studied a CPGRAMS prototype by
**a-kashif-ahmed** — <https://github.com/a-kashif-ahmed/CPGRAMS> — and it made one gap in our
own journey obvious: nothing on the device remembered the case. After Door B filed a grievance
the reference existed only in the URL, and Door A asked people to type a registration number
they had never been told to write down.

What we took is one feature idea: keep a small list of the cases this browser has seen, so a
citizen can get back to their own grievance without a reference number. Nothing else. No code,
no markup, no copy and no design crossed over. That project is Next 14 with Tailwind 4 and a
different visual language; ours is an independent rewrite into this stack — `sunvai:cases` in
`src/lib/local-cases.ts`, a server-side per-item hydration in
`src/actions/saved-case-actions.ts`, and the list itself in `src/components/MyCases.tsx`.

**Permission.** The repository's owner gave explicit permission for its use here, and is not
entering this competition. The repository carries no licence file, so that permission — not a
licence — is the basis on which we studied it. We are recording this because an unlicensed
repository is "all rights reserved" by default, and a permission that is not written down is
not a permission anyone else can check.

We do not want to overstate this. It is one feature idea, reimplemented.
