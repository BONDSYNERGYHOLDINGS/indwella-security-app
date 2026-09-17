# Security App — Architecture

## Folder structure

```text
indwella-security-app/
├── App.tsx                       # Same shape as resident: SafeAreaProvider > AuthProvider > RootNavigator
├── src/
│   ├── assets/                    # Identical asset set to the resident app (same icon files, ad images, etc.)
│   ├── components/                 # AdCarousel, AppSafeAreaView, FeatureCards, hardReset, Icon, Navbar,
│   │                               #   Recharge, TransactionList — all present but several are UNUSED
│   │                               #   by this app's three real screens (see below)
│   ├── contexts/AuthContext.tsx    # Simpler than the resident version: no FCM refresh-on-login logic
│   ├── lib/
│   │   ├── apiClient.ts             # createSecuritySdk(); exports api/securityApi/authApi
│   │   └── tokenStorage.ts          # AsyncStorage keys: security_token / security_refresh_token
│   ├── native/PhoneContactPicker.ts  # Present, unused — no screen in this app picks visitor contacts
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # AppStack vs. Drawer(SecurityStack)
│   │   ├── AppStack.tsx              # onboarding, introslider, security_auth
│   │   ├── SecurityStack.tsx          # security_home, visit_details
│   │   ├── SecurityDrawer.tsx          # Built, but NOT wired as drawerContent — dead code, see HANDOFF.md
│   │   └── types.ts
│   ├── screens/
│   │   ├── OnboardingScreen.tsx, IntroSliderScreen.tsx  # Verbatim copies of the resident app's files
│   │   └── security/
│   │       ├── Login.tsx            # Device-code auth
│   │       ├── Home.tsx             # Code verification + visit history
│   │       └── VisitDetails.tsx     # Approve/disapprove/confirm-departure
│   ├── services/
│   │   ├── imagePicker.ts           # Present, unused — this app never uploads media
│   │   └── pushNotifications.ts     # Present and wired (FCM registration), but no screen consumes
│   │                                #   an inbox for the notifications it registers to receive
│   └── types/
└── __tests__/App.test.tsx
```

## What's carried over vs. actually used

This app was scaffolded from the same template as the resident app (or vice
versa) and ships the **full dependency list and component set** of a much
richer app, but only three screens use most of it:

- **Unused components (confirmed by import search):** `FeatureCards`,
  `Recharge`, `TransactionList`, `hardReset`, `AdCarousel`, and `Navbar`
  itself are present in source but **not imported by any of**
  `Login.tsx`/`Home.tsx`/`VisitDetails.tsx` — the only shared component these
  three screens import is `Icon`. `PhoneContactPicker` (native module wrapper)
  is likewise unused.
- **Unused service:** `imagePicker.ts` — no media upload anywhere in this
  app's flows.
- **`Navbar` is not rendered anywhere in this app.** `Home.tsx` and
  `VisitDetails.tsx` both build their own headers inline instead. **Confirm
  this is intentional** rather than an oversight — the effect is that the
  resident app's notification-bell/hamburger header pattern doesn't appear
  anywhere in this app, even though the component exists (with its own
  "not available yet" alert already coded in for security's bell icon,
  meaning `Navbar` was clearly *written* with this app in mind but never
  actually wired into it).

## Entry point and provider stack

Identical pattern to the resident app:

```tsx
<SafeAreaProvider>
  <AuthProvider>
    <RootNavigator />
  </AuthProvider>
</SafeAreaProvider>
```

`App.tsx` is **byte-for-byte identical** to the resident app's (confirmed via
`diff`), including the `subscribeToForegroundPushMessages()` call on mount —
so this app *does* register a foreground push handler and *does* show
incoming pushes via the same native-module/`Alert` fallback the resident app
uses (see `pushNotifications.ts`'s `showSystemNotification`). What it lacks
is any in-app **inbox** to view past notifications (no `/notifications/*`
route is called anywhere in this app's three real screens) — pushes can
arrive and pop a system notification, but there's nowhere in the UI to review
notification history afterward.

## SDK integration

```ts
export const securitySdk = createSecuritySdk({ baseURL, storage: securityTokenStorage, onSessionExpired });
export const api = securitySdk.client.axios;
export const securityApi = securitySdk.security;
export const authApi = securitySdk.auth;
```

Same `API_BASE_URL` env-driven `baseURL` resolution as the resident app.

## State management

See `STATE-MANAGEMENT.md` — same pattern as resident: one `AuthContext`,
everything else local state, `useFocusEffect` for refresh-on-focus.

## Storage

`AsyncStorage` under `security_token` / `security_refresh_token`. No other
local persistence.
