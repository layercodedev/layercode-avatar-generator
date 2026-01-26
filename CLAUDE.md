# Avatar Builder - Claude Code Context

## Project Overview

A web app for generating 256x256 pixel art avatars from photos using OpenAI's `gpt-image-1` model. Built for Layercode team members to create consistent, stylized profile pictures.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with macOS Aqua theme
- **Database**: SQLite + Drizzle ORM
- **AI**: OpenAI API (gpt-image-1)
- **Image Processing**: Sharp

## Key Architecture

### Core Flow
1. Upload photo (human or pet)
2. AI generates 6 pixel art variants using style reference
3. User picks favorite, assigns to team member
4. History tracking with search/filter/favorites

### Important Files

| Path | Purpose |
|------|---------|
| `app/page.tsx` | Main generator UI |
| `app/history/page.tsx` | Generation history browser |
| `app/team/page.tsx` | Team member management |
| `app/api/generate/route.ts` | Avatar generation endpoint |
| `lib/db.ts` | Database connection & queries |
| `lib/schema.ts` | Drizzle schema (4 tables) |
| `public/Aidan hifi.png` | Style reference image |

### Database Schema
- `team_members` - Team info + official avatar
- `prompts` - Saved generation prompts
- `generations` - Generation records
- `variants` - 6 variants per generation

## Running Locally

```bash
npm install
npm run dev
```

Database commands:
```bash
npm run db:push    # Push schema changes
npm run db:studio  # Open Drizzle Studio
```

## Deployment

Not yet deployed. Target: Vercel with Turso (SQLite edge).

---

## Task & Backlog Management

### Adding Tasks to Linear

- **Always add backlog items to Linear** when the user mentions a feature idea or task and says to add it to the backlog
- Use the Linear GraphQL API to create issues in this project

### Task Review & Categorization

- **Periodically review and categorize tasks** in Linear based on:
  - Estimated time to implement (quick fix, medium, large)
  - Complexity (simple, moderate, complex)
  - Priority (P1 urgent, P2 high, P3 medium, P4 low)

### Task Clarity

- **Rewrite unclear tasks** when you see tasks added with notes that could be clearer
- Update the task title and description in Linear to capture the full intent

### Clarification Before Execution

- **Ask for clarification** before starting a task if you need more information to do the best job possible
- Don't assume - it's better to ask and get it right the first time

---

## Post-Commit Workflow

**After every commit that the user asks for:**

1. **Increment the app version** (patch): Update `version` in `package.json` (e.g., 0.1.0 → 0.1.1)

2. **Post a Linear project update**:
   ```bash
   curl -s -X POST https://api.linear.app/graphql \
     -H "Content-Type: application/json" \
     -H "Authorization: $LINEAR_API_KEY" \
     -d '{
       "query": "mutation CreateProjectUpdate($projectId: String!, $body: String!) { projectUpdateCreate(input: { projectId: $projectId, body: $body }) { success } }",
       "variables": {
         "projectId": "249727f6-1055-45b9-9591-eae594dfe3a4",
         "body": "## v<VERSION> - <TITLE>\n\n### Changes\n- <bullet points of changes>"
       }
     }'
   ```

3. **Mark related Linear issues as Done** if the commit implements a tracked issue:
   ```bash
   curl -s -X POST https://api.linear.app/graphql \
     -H "Content-Type: application/json" \
     -H "Authorization: $LINEAR_API_KEY" \
     -d '{
       "query": "mutation UpdateIssue($issueId: String!, $stateId: String!) { issueUpdate(id: $issueId, input: { stateId: $stateId }) { success } }",
       "variables": {
         "issueId": "<ISSUE_ID>",
         "stateId": "ab1941f6-466d-46b9-8505-10625c97efa6"
       }
     }'
   ```

   To find issues:
   ```bash
   curl -s -X POST https://api.linear.app/graphql \
     -H "Content-Type: application/json" \
     -H "Authorization: $LINEAR_API_KEY" \
     -d '{"query": "{ project(id: \"249727f6-1055-45b9-9591-eae594dfe3a4\") { issues { nodes { id title identifier state { name } } } } }"}'
   ```

4. **Commit the version bump** separately

### Multiple Tasks in One Request

- **Wait until all tasks are done** before committing when the user asks to complete multiple tasks at once
- Only increment the version number once after all tasks are complete
- Include all changes in a single project update

### Commit Message Format

- **Include Linear issue ID in commit messages** when implementing a tracked issue
- Format: `LAY-XX: Brief description of change`
- Example: `LAY-12: Add pet avatar mode`
- Linear automatically links commits to issues

### Session Summaries in Project Updates

- When posting project updates, include not just *what* changed but *why*
- Document decisions made and trade-offs considered

### Documenting Discovered Issues

- **Create separate Linear issues for bugs discovered during other work**
- Don't fix bugs silently - log them as issues first

### Technical Notes on Issues

- **Add comments to Linear issues during implementation** with:
  - Key files modified
  - Architectural decisions made
  - Gotchas or things to watch out for

### Closing Issues

- **Add a closing comment when marking issues Done** summarizing:
  - What was actually implemented
  - Any follow-up work needed
  - Testing performed

### Issue Labels

Tag issues by area:
- `generator` - Core avatar generation
- `ui` - Frontend/styling
- `api` - Backend endpoints
- `database` - Schema/queries
- `team` - Team member features
- `history` - History/search features

---

## Linear Configuration

| Setting | Value |
|---------|-------|
| API Key | `$LINEAR_API_KEY` in `.env.local` |
| Project ID | `249727f6-1055-45b9-9591-eae594dfe3a4` |
| Team ID | `eff783c0-7479-4001-8002-6c2aede5f1ca` |
| Team Key | `LAY` (issues are LAY-XX) |
| Done State ID | `ab1941f6-466d-46b9-8505-10625c97efa6` |

---

## Project Structure

```
avatar-app/
├── app/
│   ├── api/
│   │   ├── generate/route.ts
│   │   ├── generations/
│   │   ├── prompts/route.ts
│   │   ├── team/route.ts
│   │   └── variants/[id]/route.ts
│   ├── history/page.tsx
│   ├── team/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── db.ts
│   └── schema.ts
├── public/
│   └── Aidan hifi.png
├── drizzle.config.ts
└── package.json
```
