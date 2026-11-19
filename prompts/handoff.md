# Handoff

> Use this when a session is getting long or drifting, or before you switch
> tasks. Then start a fresh session and point it at the handoff file.

Write a handoff document to `docs/handoffs/<short-topic>.md` so a new session
with no memory of this conversation can continue the work.

Include:

- **Goal**: what we're trying to achieve, and the spec or request it comes from.
- **Done so far**: what's implemented, with file paths.
- **Decisions**: choices we made in this session and *why*, including the
  alternatives we rejected.
- **Current state**: what passes and what fails right now (run the checks).
- **Next steps**: an ordered list, smallest first.
- **Gotchas**: anything surprising we learned that isn't obvious from the code.

Keep it short. Leave out anything the next session can learn by reading the
code or the git log.
