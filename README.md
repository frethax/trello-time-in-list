# Kanbrain

Kanbrain is a Trello Power-Up for Time in List, card numbering, subtasks, and resource planning.

## Resource Planning MVP

Board admins can add, edit, and delete multiple member assignments with inclusive start and end dates on each card. **Resource Planner** on the board opens a weekly or monthly timeline, filters by member, highlights assignments that overlap on at least one weekday, and links each assignment to its Trello card. One assignment represents full days. Working days are Monday through Friday; Saturdays and Sundays never count, and public holidays still count. This calculation does not read or change the Time in List `workdays` setting.

The card section appears only after the server confirms board admin access. The board button also uses Trello's admin condition. Planner data is kept in server-side Redis rather than Trello board-shared Power-Up storage. Every API request checks the caller's current Trello board membership; hiding the button is not the security boundary. Existing Time in List and other Power-Up data stay in their original storage.

### Deployment

The repository is configured for Vercel. Provision an Upstash Redis database with a REST endpoint and set these **server-only** Vercel environment variables:

| Variable | Value |
| --- | --- |
| `TRELLO_API_KEY` | The Trello Power-Up API key used by `connector.js` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

Deploy the updated static files and `/api/resource-planning` function together. Do not put the Redis token in client code or `board/shared` storage. Until these variables are configured, the planner API returns `503` and the card's Resource Planning section stays unavailable. The existing Power-Up features continue to run.

The existing Power-Up authentication uses a Trello read token. The API accepts it in the `Authorization` header, checks `/members/me` and `/boards/{id}/memberships` on every request, and allows only a confirmed `admin` membership. It validates that assigned members belong to the board and that the target card is open on that board. No token is stored. API responses disable caching. As with all browser software, admins can see data they are authorized to read; removing someone as an admin blocks future API access but cannot revoke data they previously viewed.

### Run tests

```sh
node --test
```

The tests cover inclusive weekday counts, weekends and holidays, date bounds, overlap behavior, admin access checks, role changes, and assignment CRUD.
