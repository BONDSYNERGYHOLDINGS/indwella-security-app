# Security App — Architecture

## Folder structure

```text
indwella-security-app/
├── App.tsx                       # Same shape as resident: SafeAreaProvider > AuthProvider > RootNavigator
├── src/
│   ├── assets/                    # Identical asset set to the resident app (same icon files, ad images, etc.)
│   ├── components/                 # AdCarousel, AppSafeAreaView, hardReset, Icon, Recharge, TransactionList
│   │                               #   — several are UNUSED by this app's three real screens (see below).
│   │                               #   Navbar.tsx and FeatureCards.tsx, both carried over from the resident
│   │                               #   scaffold and unused here, have since been deleted outright.
│   ├── contexts/AuthContext.tsx    # Simpler than the resident version: no FCM refresh-on-login logic
│   ├── lib/
│   │   ├── apiClient.ts             # createSecuritySdk(); exports api/securityApi/authApi
│   │   └── tokenStorage.ts          # AsyncStorage keys: security_token / security_refresh_token
│   ├── native/PhoneContactPicker.ts  # Present, unused — no screen in this app picks visitor contacts
│   ├── navigation/
│   │   ├── RootNavigator.tsx        # AppStack vs. Drawer(SecurityStack)
│   │   ├── AppStack.tsx              # introslider, security_auth — no role-picker step (see HANDOFF.md,
│   │   │                             #   the former OnboardingScreen role-picker has since been deleted)
│   │   ├── SecurityStack.tsx          # security_home, visit_details
│   │   ├── SecurityDrawer.tsx          # Built, but NOT wired as drawerContent — dead code, see HANDOFF.md
│   │   └── types.ts                   # Clean now — no more vestigial Resident/AdminStackParamList entries
│   ├── screens/
│   │   ├── IntroSliderScreen.tsx     # Security-app-flavored intro slide deck
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
versa) and still ships a chunk of that richer app's dependency/component
footprint, but only three screens use most of it:

- **Unused components (confirmed by import search):** `Recharge`,
  `TransactionList`, `hardReset`, `AdCarousel` are present in source but
  **not imported by any of** `Login.tsx`/`Home.tsx`/`VisitDetails.tsx` — the
  only shared component these three screens import is `Icon`.
  `PhoneContactPicker` (native module wrapper) is likewise unused.
- **Unused service:** `imagePicker.ts` — no media upload anywhere in this
  app's flows.
- **`Navbar` and `FeatureCards` have been deleted from this app entirely**
  (they previously existed here, carried over unused from the resident
  scaffold — an earlier pass of this doc described them as "present but
  unused"; a later cleanup removed both files outright). `Home.tsx` and
  `VisitDetails.tsx` build their own headers inline — there is no
  notification-bell/hamburger header pattern anywhere in this app's UI at
  all now, not even as an unused component.

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
