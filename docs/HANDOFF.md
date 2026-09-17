# Security App — Handoff Notes

App-specific bugs, limitations, and next steps. Platform-wide items are in
`../ENGINEERING-HANDOFF.md`.

## Bugs specific to this app

1. **Onboarding role picker dead-ends** for "Resident"/"Facility Manager"
   choices, same root cause as the resident app's version of this bug — see
   `../ENGINEERING-HANDOFF.md`.
2. **Shares the Android `applicationId` `com.indwella_client`** with the
   resident app — see `../ENGINEERING-HANDOFF.md`. Release blocker if both
   apps ship to real devices/stores simultaneously.
3. **`SecurityDrawer.tsx` is unused/dead code.** Built (support links,
   logout button, branding) but never passed as `drawerContent` to this
   app's `Drawer.Navigator` — contrast with the resident app, where the
   equivalent component *is* wired up correctly. The drawer a user actually
   sees today is React Navigation's unstyled default.

## Limitations worth knowing before extending this app

- **Client-side-only visitor search** at scale won't hold up if an estate's
  visit history grows large — the backend already has a dedicated
  `/search-visitor` endpoint that isn't being used. This is the clearest
  "quick win" refactor available in this app.
- **No notifications of any kind reach the guard while in-app**, beyond raw
  OS-level push alerts (the app does register for and can display FCM
  pushes via `pushNotifications.ts` — see `ARCHITECTURE.md` — but there's no
  in-app inbox to review history, unlike the resident app).
- **This app carries the full dependency and component footprint of the
  resident app's scaffold** (`FeatureCards`, `Recharge`, `TransactionList`,
  `hardReset`, `imagePicker`, `PhoneContactPicker`, `AdCarousel` are all
  present in source but unused by any of the three real screens) — a
  reasonable target for a cleanup pass if bundle size or code clarity ever
  becomes a priority, since none of it is load-bearing for this app's actual
  feature set.

## Suggested next steps, app-specific

1. Wire `security.searchVisitor()` into `Home.tsx`'s search box instead of
   (or as a fallback alongside) the current client-side filter, especially
   before this app is used at any estate with meaningful visit-history
   volume.
2. Either wire `SecurityDrawer` into `RootNavigator`'s `Drawer.Navigator` as
   `drawerContent`, or delete it if the default drawer is the intended
   design.
3. Consider trimming unused components/dependencies from this app's bundle
   once the codebase stabilizes, to reduce confusion for engineers who might
   otherwise assume `FeatureCards`/`Recharge`/etc. are live code paths here.
4. If push-notification history ever becomes a requirement for guards (e.g.
   "notify security when a new visit is booked for their estate"), the
   resident app's `NotificationScreen.tsx` + `notifications` SDK module is
   the direct template to adapt — the backend route group
   (`/notifications/*`) doesn't currently expose a security-scoped variant,
   so a backend change would likely be required first.
