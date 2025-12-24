# Workflow

## Default workflow
1. Create/Update `spec.md` and `plan.md` for a track.
2. Implement in small, testable increments.
3. Verify locally (build client + build server).
4. Keep secrets out of git.

## Quality gate (planning)
A track plan should include:
- Scope + non-goals
- Data model changes (if any)
- API endpoints (request/response shape)
- UI pages/components touched
- Error states + empty states

