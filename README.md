# Kanbrain

Trello Power-Up for time in list, card numbering, subtasks, and resource planning.

## Resource Planning

Board admins plan directly inside a card. Select a board member, then click individual dates in the calendar; dates can have gaps and span months. Each card has one editable plan per member. Saturdays and Sundays cannot be selected; public holidays can. Every selected date is one full working day. Planning does not read or change the Time in List `workdays` setting.

The board **Resource Planner** shows selected days by member in weekly or monthly views. Shared selected days for the same member are highlighted as conflicts. Click an allocation to open its Trello card. Archived cards can be shown with the **Show archived cards** option.

### Access and storage

Plan data is stored in server-side Redis. The `/api/resource-planning` function verifies the caller's *current* Trello board admin membership on every read and write, including direct API requests. It checks that a selected member belongs to the board and that new or edited plans refer to an open card on that board. Plan data is not stored in board-shared Power-Up storage. Trello tokens are used for each request but are not persisted by Kanbrain. Responses disable caching.

The previous Resource Planner stored date ranges in each admin's **member-private** Trello Power-Up storage. Its card and board views remain available as **Previous Allocations** and **My Previous Planner** so those records are not lost. They are separate from the new shared admin planner; there is no automatic transfer of private plans into shared storage. Admins can still use those views until they choose to recreate their dates in the card calendar. Removing an admin blocks new API access but cannot revoke any data that person already viewed or saved in their own private storage.

### Deployment

The repository is configured for Vercel. In the Vercel project's **Storage** or **Integrations** area, create an Upstash Redis database and connect it to `trello-time-in-list`. The connection must make its REST URL and token available to the project. Set these **server-only** environment variables for both Preview and Production:

| Variable | Value |
| --- | --- |
| `TRELLO_API_KEY` | The Trello Power-Up API key used by `connector.js` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

Redeploy after adding the variables: Vercel deployments receive environment variables at build/deployment time. Deploy the static files and `/api/resource-planning` function together. Do not put the Redis token in client code or Trello Power-Up storage. Until these variables are configured, the new planner API returns `503`; the existing Power-Up features and previous private planner continue to work. A ready Preview deployment does not make the feature appear in Trello: `connector.js` points to the production domain, so the production deployment must include this change.

### Tests

```sh
node --test
```

Tests cover individual date selection, weekends and holidays, exact-day overlaps, admin access, role changes, archived cards, and plan CRUD. Live Trello and Redis integration must also be checked after deployment.
