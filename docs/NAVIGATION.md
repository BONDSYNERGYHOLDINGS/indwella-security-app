# Security App — Navigation

```text
AppStack (public — unauthenticated)
├── onboarding         OnboardingScreen — role picker (same file as resident app; only 'security_auth' is registered here)
├── introslider          IntroSliderScreen
└── security_auth         Login.tsx — device-code entry

Drawer("SecurityApp") (authenticated — drawerContent NOT customized, uses React Navigation's default drawer, not SecurityDrawer.tsx)
└── SecurityStack
    ├── security_home       Home — code entry + visit history
    └── visit_details        VisitDetails — approve/disapprove/confirm departure
```

That's the entire app: three real screens (`security_auth`, `security_home`,
`visit_details`) plus two shared onboarding screens.

## Navigation param types (`src/navigation/types.ts`)

```ts
type SecurityStackParamList = {
  security_home: undefined;
  visit_details: {
    code: string;
    visitor: {
      id: number; visitor_name: string; visitor_phone: string; house_address: string;
      start_time: string; end_time: string; time_left: string; status: string;
      approval_status: string; comment?: string | null; departure_confirmed?: boolean;
    };
  };
};
```

Same as the resident app, `RootStackParamList` in this file also declares
`ResidentStackParamList` and `AdminStackParamList` entries plus `resident_auth`
and `admin_auth` routes that are **not registered** in this app's `AppStack`
— leftover from the pre-split shared codebase, and the direct cause of the
onboarding role-picker dead end documented in `../ENGINEERING-HANDOFF.md`.

## How a visit is reached

`security_home`'s code-verification flow and its history-list "View Details"
button both navigate to `visit_details`, passing the full visitor payload
already fetched (from `GET /verify-visitor-details/{code}` or
`GET /security/visitor-details/{code}` respectively) as a route param —
`VisitDetails.tsx` does not re-fetch on mount; it works entirely off the
navigation params it was given, with local `useState` seeded from them.

## Back navigation

`VisitDetails.tsx`'s back button calls `navigation.popToTop()` if
`canGoBack()`, or falls back to `navigation.navigate('security_home')` — this
returns to the home screen and, since `Home.tsx` refetches history on every
`useFocusEffect`, picks up any status change just made (approve/disapprove/
confirm-departure) without an explicit refetch call from `VisitDetails.tsx`
itself.
