# Admin QA Checklist

## Role Access
- ADMIN can open `/[locale]/admin` and see Moderation, Content, Users, Analytics, Audit tabs.
- MODERATOR can open `/[locale]/admin` and only see Moderation and Content tabs.
- USER cannot access `/[locale]/admin`.

## Moderation Queue
- Load reports by status (`OPEN`, `REVIEWED`, `RESOLVED`, `DISMISSED`).
- Update report status and verify reviewer note persists.
- Confirm report review action is logged in audit stream.

## Content Controls
- Hide/unhide thread and confirm visibility changes on forum pages.
- Lock/unlock and pin/unpin thread.
- Hide/unhide comment and confirm comment disappears/reappears publicly.
- ADMIN only: delete thread/comment/diary.

## User Controls
- Search users by username/email.
- Change role (`USER`, `MODERATOR`, `ADMIN`).
- Suspend and unsuspend user; verify suspension fields update.

## Analytics
- Load 7/30/90 day views.
- Validate totals, DAU/WAU/MAU, open reports, and resolution hours.
- Confirm top topics reflect thread counts.

## Audit Logs
- Load latest audit logs and verify actor/action/target/reason.
- Validate before/after payloads for at least one moderation action.
