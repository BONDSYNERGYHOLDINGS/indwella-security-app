# Security App — Features

## Device Login — `screens/security/Login.tsx` — Complete

See `AUTHENTICATION.md` for the full trace. `POST /security_login` with code
+ device metadata; success stores the token pair and flips
`isAuthenticated`.

## Verify Visitor — `screens/security/Home.tsx` — Complete

- **What it does:** a 6-character code-entry box (auto-uppercases,
  alphanumeric-only, visual "filled dot" indicator per character) with a
  "Verify Code" button.
- **SDK/API:** `GET /verify-visitor-details/{code}` via raw `api.get`. On
  success, navigates to `visit_details` with the returned visitor payload as
  a route param; on failure, marks the code box invalid and shows the
  backend's error message.
- **Auth requirement:** authenticated security device.
- **Known limitation:** none — this is the app's core, well-built happy path.

## Visit History (with search) — `screens/security/Home.tsx` — Partial

- **What it does:** below the code-entry box, a "Visit History" section
  lists all visits for the estate (`GET /visitor-history`, refetched on
  focus), with a search box and a date-picker filter.
- **SDK/API:** `GET /visitor-history` via raw `api.get`. **Search is
  entirely client-side** — the search box filters the already-fetched
  `history` array in memory (`visitor_name`, `house_address`,
  `approval_status`, `access_code` substring match), rather than calling the
  SDK's `security.searchVisitor(query)` / `GET /search-visitor`. Tapping a
  history item calls `GET /security/visitor-details/{code}` to fetch fresh
  details before navigating to `visit_details`.
- **Known limitation:** at estate scale, fetching the *entire* visit history
  on every focus and filtering client-side will not scale the way a real
  server-side search would — see `../ENGINEERING-HANDOFF.md` and
  `../FEATURE-MATRIX.md`.

## Visit Details / Decision — `screens/security/VisitDetails.tsx` — Complete

- **What it does:** shows visitor name/phone/access-code/times/unit/comment,
  a countdown "time left," and role-appropriate actions:
  - While `approval_status === 'pending'`: **Approve** (bottom sticky button)
    and **Decline** (inline button next to the property-unit field).
  - Once `approval_status === 'approved'`: a **Confirm departure** button
    appears (disabled once already confirmed).
- **SDK/API:**
  - `POST /security/approve-visitor/{code}`
  - `POST /disapprove-visitor/{code}`
  - `POST /security/confirm-departure/{code}`

  All three via raw `api.post`, and all three update local component state
  optimistically on success rather than re-fetching.
- **Auth requirement:** authenticated security device.
- **Known limitation:** none functional; note that this screen trusts its
  own local state after a mutation rather than confirming against a re-fetch
  — acceptable given the simple three-state lifecycle (pending → approved/
  disapproved → departed), but worth knowing if the backend ever introduces
  additional states this screen doesn't already model.

## Not implemented in this app

- **Notifications inbox** — `Navbar`'s bell icon (not used by this app at
  all, per `ARCHITECTURE.md`) has an explicit `"Notifications are not
  available for security users yet"` alert coded in for the `security` role,
  confirming this is a known, acknowledged gap rather than an oversight.
- **Visitor search via backend** — see above.
- **Any resident-, wallet-, or admin-facing feature** — entirely out of this
  app's scope by design; see `../USER-ROLES.md`.
