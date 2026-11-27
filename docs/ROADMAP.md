# LGU Connect: system plan

Status as of 27 November 2026: all four workspaces are built on one database schema (`prisma/schema.prisma`), with no schema changes after the first migration. What is left is in section 7.

## 1. User levels and scope

| Level | Signs in at | Scope (enforced on the server) | Home |
| --- | --- | --- | --- |
| Barangay Secretary | `/province/municipality/barangay` | One barangay (`User.barangayCode`) | `/dashboard` (done) |
| Municipal Personnel | `/province/municipality` | One municipality and one office (`municipalityCode`, `officeId`) | `/municipal` (done) |
| Municipal IT Admin | `/province/municipality` (same page as personnel) | One municipality | `/admin` (done) |
| Superadmin | `/login` | Everything | `/superadmin` (done) |

The sign-in page is only a filter. `POST /api/auth/login` checks the password, the role, that the account belongs to the chosen barangay or municipality, and that the barangay and municipality are active. Sessions are random tokens in an HTTP-only cookie; only their SHA-256 is stored (`Session`). Five wrong passwords lock the account for 15 minutes; 20 failed attempts from one IP address block it for 15 minutes. All four areas share one shell (`src/config/workspaces.ts` holds each role's menu).

### Permissions

Defaults per role live in `src/server/auth.ts` (`ROLE_PERMISSIONS`). Extra grants go in `User.permissions`.

| Permission | Who | Used for |
| --- | --- | --- |
| `profile:edit`, `residents:manage`, `documents:issue`, `incidents:record`, `resources:manage`, `reports:submit`, `announcements:barangay` | Secretary | Every secretary module |
| `vawc:view` | Granted per user by the IT admin | VAWC records (RA 9262) |
| `submissions:review`, `announcements:municipal`, `reports:consolidated` | Municipal Personnel | Phase 2 |
| `users:manage`, `barangays:onboard`, `documents:configure`, `audit:view` | Municipal IT Admin | Phase 3 |
| `*` | Superadmin | Phase 4 |

## 2. Data model (one schema for all levels)

| Area | Models | Notes |
| --- | --- | --- |
| Geography | `Region`, `Province`, `Municipality`, `Barangay`, `Purok` | 10-digit PSGC codes as keys, same codes the sign-in page sends. `isActive` marks onboarded LGUs. The barangay row also holds the profile (history, boundaries, contacts, hotlines). |
| Accounts | `User`, `Session`, `MunicipalOffice` | Role, scope, extra permissions, preferences, lockout fields. |
| Residents | `Household`, `Family`, `Resident` | Classification flags (voter, PWD, solo parent, 4Ps, OSY, OFW, IP); seniors are derived from birth date. Soft delete. |
| Documents | `DocumentType`, `DocumentRequest`, `IssuedDocument` | Fees and wording per barangay. Issued documents keep a snapshot of the resident so reprints match. Expiry is derived, never stored. |
| Blotter | `BlotterEntry`, `BlotterParty`, `CaseHearing` | Incidents and complaints, Katarungang Pambarangay stage and deadline, VAWC flag. |
| Community | `Animal`, `CommunityResource` | Water service level is on `Household`. |
| Reporting | `ReportRequirement`, `Submission` | Requirements come from municipal offices; submissions save the generated figures as JSON. |
| Communication | `Announcement`, `AnnouncementRead`, `Notification` | Scope: system, municipal, or barangay. |
| Audit | `AuditLog`, `Counter`, `SystemSetting` | Every change and sign-in is logged. `Counter` issues running numbers per barangay. |

## 3. Phase 1: Barangay Secretary (done)

| Module | Pages | What works |
| --- | --- | --- |
| Dashboard | Overview | Live counts and month-on-month trends, tasks computed from deadlines, demographics, announcements, activity timeline |
| Barangay Profile | Information, Officials, Organization, Contacts | Edit info and boundaries, puroks, officials (with certificate signatory), councils, contacts, office hours, hotlines |
| Residents | Records, Add, Households, Families, Classification | Search and filters, create, edit, archive, change history, household members and families, sector lists, CSV export |
| Documents | Requests, Issuance, four certificate pages, Other, History, Print | Request workflow (pending → processing → ready → released / rejected), issuing with control numbers and live preview, printing, voiding, fees and requirements per document |
| Blotter | Records, New report, Complaints, Cases, KP, VAWC | Parties (residents or outsiders), status and outcome, KP stages with 15-day deadlines and extension, hearings, VAWC kept separate and permission-gated |
| Community | Animals, Water service, Resources | Animal registry and vaccination tracking, water level per household and by purok, resource inventory |
| Reports | Five reports and Generate | Period filters, print layout with signature lines, CSV |
| Submissions | Submit, History, Pending, Status | Generates and saves figures, resubmits returned reports, notifies the reviewing office |
| Announcements | Municipal, Barangay, Notifications, Advisories | Read tracking, barangay posts (draft, pin, expiry) |
| Activity | Recent, Record updates | Audit log with before → after values |
| Settings | Account, Password, Preferences | Password change with sign-out of other devices, active sessions |

## 4. Phase 2: Municipal Personnel (`/municipal`, done)

| Page | What works |
| --- | --- |
| Overview | Municipal totals from active barangays, requirement progress, latest submissions |
| Submissions | Inbox for the user's office (or all offices), oldest first; open the saved report; start review, approve, or return with remarks; versions of resubmitted reports. The barangay secretary is notified. |
| Requirements | Create, edit, deactivate; every active barangay secretary is notified of a new one |
| Compliance | Per requirement: which barangays submitted, late, or not yet |
| Barangays | Directory with residents, households, secretary contact, overdue reports |
| Consolidated Reports | Any report summed across active barangays, with a per-barangay table; print |
| Announcements | Post to every barangay (advisory, pin, expiry, draft); read counts; secretaries notified |

## 5. Phase 3: Municipal IT Admin (`/admin`, done)

| Page | What works |
| --- | --- |
| Overview | Active, locked, and temporary-password accounts; failed sign-ins; onboarded barangays without a secretary |
| User Accounts | Create secretaries and municipal personnel (temporary password shown once, must change on first sign-in); edit; reset password; unlock; suspend, reactivate, deactivate (signs them out); grant or remove VAWC access |
| Barangay Onboarding | Activate a barangay (adds puroks, default document types and fees, councils); deactivate (signs its secretaries out) |
| Offices | Add, rename, deactivate municipal offices |
| Audit Log | Sign-ins, failed attempts (including unknown usernames), exports, and changes in the municipality |

## 6. Phase 4: Superadmin (`/superadmin`, done)

| Page | What works |
| --- | --- |
| Overview | Municipalities, onboarded barangays, residents, sessions, database size, failed sign-ins, accounts by role |
| Municipalities | Onboard from the official PSGC list (loads all barangays and default offices); refresh names; deactivate (signs everyone out) |
| Administrators | Municipal IT admins and superadmins: create, reset, suspend |
| System Settings | Session length, minimum password length, and a banner shown on every signed-in page. Applied immediately. |
| Audit Log | Everything, filterable by municipality |

## 7. Cross-cutting work before going live

- **Rate limiting across servers**: the per-IP limit is kept in memory, which is fine for one server. With several app servers, move it to Redis or the reverse proxy.
- **Email** for password resets and notification preferences (`User.preferences.email` is stored, not sent).
- **File uploads** (resident photos, scanned requirements, barangay seal for certificates): add an `Attachment` model and object storage.
- **Backups**: `npm run db:backup` writes a compressed dump to `backups/` and keeps 14. Still to do: schedule it nightly, copy dumps off the server, and test a restore.
- **Data Privacy Act (RA 10173)**: privacy notice on sign-in, retention rules, access logs (the audit log covers most of it).
- **Tests**: the end-to-end flows used during development (all four roles: sign-in, register, issue, void, KP case, submit → review → return, account creation with temporary password, suspension, banner, rate limit) should become a Playwright suite in CI.
- **Municipal document defaults**: municipalities cannot yet change the default certificate wording and fees for new barangays (barangays can change their own). Needs one template table.
- **Online requests from residents**: the `ONLINE` channel exists in the schema, but there is no resident-facing page yet.
- **Deployment**: managed PostgreSQL, `DATABASE_URL`, `npm run build`, run `prisma migrate deploy` on release.
