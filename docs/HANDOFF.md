# Security App — Handoff Notes

App-specific bugs, limitations, and next steps. Platform-wide items are in
`../ENGINEERING-HANDOFF.md`.

## Bugs specific to this app

1. **Shares the Android `applicationId` `com.indwella_client`** with the
   resident app — see `../ENGINEERING-HANDOFF.md`. Release blocker if both
   apps ship to real devices/stores simultaneously.
2. **`SecurityDrawer.tsx` is unused/dead code.** Built (support links,
   logout button, branding) but never passed as `drawerContent` to this
   app's `Drawer.Navigator` — contrast with the resident app, where the
   equivalent component *is* wired up correctly. The drawer a user actually
   sees today is React Navigation's unstyled default.

**Fixed since the last pass of this doc, no longer tracked here:**
- The onboarding role-picker screen (`OnboardingScreen.tsx`, a verbatim copy
  of the resident app's dead-ending "Resident"/"Facility Manager" picker) has
  been deleted outright — `AppStack` now opens directly on `introslider`. The
  vestigial `ResidentStackParamList`/`AdminStackParamList` types and
  unregistered `resident_auth`/`admin_auth` route entries are also gone from
  `navigation/types.ts`. See `ARCHITECTURE.md` and `NAVIGATION.md`.
- `Navbar.tsx` and `FeatureCards.tsx` — both carried over unused from the
  resident app's scaffold — have been deleted from this app's source
  entirely, rather than just sitting unused. See `ARCHITECTURE.md`.
- `@indwella/sdk` is now a **private git dependency**
  (`git+https://github.com/BONDSYNERGYHOLDINGS/indwella-sdk.git#main`), not
  a sibling `file:../indwella-sdk` path — the latter only ever worked when
  this app happened to be checked out next to the SDK repo, which broke the
  admin-web Netlify deploy outright the first time it was tried from an
  isolated checkout. This app doesn't have hosted CI today, so nothing to
  configure yet, but if that changes, see
  `../indwella-sdk/docs/HANDOFF.md` → "Dependency model" and
  `../indwella-admin-web/docs/HANDOFF.md` (item 6) for the private-repo CI
  auth pattern (`scripts/ci-git-auth.js` + a `SDK_GIT_TOKEN` env var) —
  already wired up here as a no-op `preinstall` script, ready for when a
  hosted CI needs it.

## Limitations worth knowing before extending this app

- **Client-side-only visitor search** at scale won't hold up if an estate's
  visit history grows large — the backend already has a dedicated
  `/search-visitor` endpoint that isn't being used. This is the clearest
  "quick win" refactor available in this app.
- **No notifications of any kind reach the guard while in-app**, beyond raw
  OS-level push alerts (the app does register for and can display FCM
  pushes via `pushNotifications.ts` — see `ARCHITECTURE.md` — but there's no
  in-app inbox to review history, unlike the resident app).
- **This app still carries part of the resident app's scaffold footprint**
  (`Recharge`, `TransactionList`, `hardReset`, `imagePicker`,
  `PhoneContactPicker`, `AdCarousel` are all present in source but unused by
  any of the three real screens) — a reasonable target for a cleanup pass if
  bundle size or code clarity ever becomes a priority, since none of it is
  load-bearing for this app's actual feature set. `Navbar` and `FeatureCards`
  were already removed this way; the remaining list is what's left.

## Suggested next steps, app-specific

1. Wire `security.searchVisitor()` into `Home.tsx`'s search box instead of
   (or as a fallback alongside) the current client-side filter, especially
   before this app is used at any estate with meaningful visit-history
   volume.
2. Either wire `SecurityDrawer` into `RootNavigator`'s `Drawer.Navigator` as
   `drawerContent`, or delete it if the default drawer is the intended
   design.
3. Consider trimming the remaining unused components/dependencies from this
   app's bundle once the codebase stabilizes, to reduce confusion for
   engineers who might otherwise assume `Recharge`/`TransactionList`/etc.
   are live code paths here — the same cleanup already done for
   `Navbar`/`FeatureCards`.
4. If push-notification history ever becomes a requirement for guards (e.g.
   "notify security when a new visit is booked for their estate"), the
   resident app's `NotificationScreen.tsx` + `notifications` SDK module is
   the direct template to adapt — the backend route group
   (`/notifications/*`) doesn't currently expose a security-scoped variant,
   so a backend change would likely be required first.
