# Kanbrain

Trello Power-Up for time in list, card numbering, subtasks, and resource planning.

## Resource Planning (October 2026 MVP)

Board administrators can use **Resource Allocation** on a card to choose a board member and an inclusive start/end date. The **Resource Planner** board button displays assignments by member in weekly or monthly timelines. Assignments can overlap; overlapping working days are highlighted. Clicking a task opens the Trello card.

**Working days:** Monday through Friday, inclusive of start and end when those dates are weekdays. Saturday and Sunday are *never* counted, regardless of the existing optional Time-in-List weekend setting. Public holidays are not accounted for. Each working day represents one allocated day; there is no hourly/capacity percentage data.

**Storage:** The source of truth is the `kbResourceAllocations` key in card-shared Power-Up storage. There is no new server/database. This avoids a single board-wide storage value limit, but the board view reads every card and therefore may be slow on very large boards.

**Access control limitation:** Only board administrators are offered the UI and the modal checks current board admin membership using Trello REST. This is **not a confidentiality/security boundary**: Trello's shared Power-Up storage can be read by other board members or Power-Ups with access to that storage. Do not store confidential staffing data here. A server with verified admin authorization is required for confidential resource allocations.

## Manual smoke test

1. Authorize the Power-Up with Trello read access as a board admin.
2. Open a card, select **Resource Allocation**, select a member and Friday–Tuesday; confirm the duration is 3 days.
3. Add a second allocation overlapping the first; verify the **Resource Planner** highlights the overlapping weekday cells.
4. Edit and delete assignments; reload and verify persistence.
5. Use weekly/monthly navigation, member filter, and click a task to open its Trello card.
6. Verify non-admin board members cannot open the admin Resource Planning UI. (Remember the storage limitation above.)
7. Check existing number badges, time badges, Main Task and Add Subtask controls are unaffected.

Live Trello and deployment checks are still required after merging.
