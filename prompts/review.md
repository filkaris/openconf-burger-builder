# Fresh-eyes review

> Run this in a **new** session that did not write the code.

Review the uncommitted changes in this repository (`git status`, `git diff`,
plus any new files).

1. Work out what the change is trying to do. If there is a spec in
   `docs/specs/` or a `DECISIONS.md`, read it first.
2. Check every assumption the change makes about external systems against the
   docs in `docs/`. Point to the doc line that confirms or contradicts it.
3. Check that the change follows the decisions in `docs/adr/` and matches the
   surrounding code.
4. Look for behaviour nobody asked for, and for rules with no test.
5. Run the checks (`npm test`) and report the results.

Report findings ranked by severity: what's wrong, where, and a concrete
scenario that shows it. Don't fix anything yet.
