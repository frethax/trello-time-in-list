# Kanbrain

Trello Power-Up for time in list, card numbering, subtasks, and resource planning.

## Resource Planning (October 2026 MVP)

Board administrators can use **Resource Allocation** on a card to choose a board member and an inclusive start/end date. The **Resource Planner** board button displays assignments by member in weekly or monthly timelines. Assignments can overlap; overlapping working days are highlighted. Clicking a task opens the Trello card.

**Working days:** Monday through Friday, inclusive of start and end when those dates are weekdays. Saturday and Sunday are *never* counted, regardless of the existing optional Time-in-List weekend setting. Public holidays are not accounted for. Each working day represents one allocated day; there is no hourly/capacity percentage data.

**Storage:** The source of truth is the `kbResourceAllocations` key in card-**private** Power-Up storage for the currently signed-in Trello member. There is no new server/database. Each admin has an independent planner and cannot see another admin's allocations. The board view reads active and archived cards, which may be slow on very large boards. Existing shared allocations are copied into the current member's private storage and then removed from shared storage when that card is loaded by an admin. Loading Resource Planner includes archived cards, allowing their existing shared allocations to be migrated and removed as well.

**Access model:** The UI is shown only to board administrators, and the modal checks board admin membership with Trello REST. Trello private Power-Up storage is visible only to the member who stored it, not to other board members (including other admins). This is a single-user planner, not shared team scheduling. Existing shared records remain exposed until they are migrated and removed; Trello board members may already have read them before migration. This change cannot retroactively revoke prior access.

**Archived tasks:** The Resource Planner uses Trello's all-cards REST endpoint to load both active and archived cards. The **Show Archived Tasks** checkbox is off by default; turn it on to see archived tasks labeled **Archived** alongside active tasks. Resource allocation records stay in member-private storage. The archived filter never deletes allocation data.\n\n## Manual smoke test

1. Authorize the Power-Up with Trello read access as a board admin.
2. Open a card, select **Resource Allocation**, select a member and Friday–Tuesday; confirm the duration is 3 days.
3. Add a second allocation overlapping the first; verify the **Resource Planner** highlights the overlapping weekday cells.
4. Edit and delete assignments; reload and verify persistence.
5. Archive a card with an allocation: confirm it is hidden by default and reappears with an Archived label when Show Archived Tasks is enabled. Verify working days and previous assignments remain unchanged.\n6. Use weekly/monthly navigation, member filter, and click an active task to open its Trello card.
6. Verify non-admin board members cannot open the admin Resource Planning UI. (Remember the storage limitation above.)
7. Log in as another board admin and confirm they cannot see the first admin's private allocations.\n8. Verify pre-existing shared allocations are migrated, and shared keys are removed on each visited open card.\n9. Check existing number badges, time badges, Main Task and Add Subtask controls are unaffected.

Live Trello and deployment checks are still required after merging.
