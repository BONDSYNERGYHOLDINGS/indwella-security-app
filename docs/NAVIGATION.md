# Security App — Navigation

```text
AppStack (public — unauthenticated)
├── introslider          IntroSliderScreen — first screen shown, no role picker
└── security_auth         Login.tsx — device-code entry

Drawer("SecurityApp") (authenticated — drawerContent NOT customized, uses React Navigation's default drawer, not SecurityDrawer.tsx)
└── SecurityStack
    ├── security_home       Home — code entry + visit history
    └── visit_details        VisitDetails — approve/disapprove/confirm departure
```

That's the entire app: three real screens (`security_auth`, `security_home`,
`visit_details`) plus the intro slider. The former `onboarding` role-picker
screen (a verbatim copy of the resident app's, offering "Resident"/"Facility
Manager" choices that dead-ended for both) has been deleted outright —
`AppStack` now opens directly on `introslider`, matching the resident app's
equivalent fix.

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

`RootStackParamList` is now clean — just `introslider`, `security_auth`, and
`SecurityApp`. It used to also declare vestigial `ResidentStackParamList`/
`AdminStackParamList` entries and unregistered `resident_auth`/`admin_auth`
routes, leftover from the pre-split shared codebase and the direct cause of
the onboarding role-picker dead end; both the dead types and the onboarding
screen itself have since been removed together. See `../ENGINEERING-HANDOFF.md`
for the platform-wide history of that split.

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
