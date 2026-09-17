# Security App — State Management

## AuthContext

`src/contexts/AuthContext.tsx` is simpler than the resident app's version —
no FCM-token-refresh-on-login side effect:

```ts
type AuthContextType = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
};
```

Behavior is otherwise identical in shape to the resident app: reads token
storage on mount to set initial `isAuthenticated`, registers with the SDK's
`setSessionExpiredHandler`, `logout()` calls the backend logout route and
clears storage.

## No global data store

Same as the resident app — no Redux/Zustand/React Query. All server data is
local `useState` per screen.

## Local state highlights

- **`Home.tsx`** holds the code-entry input, search query, selected date
  filter, and the fetched visit-history array all as sibling `useState`
  values, with `filteredHistory` computed inline on every render (not
  memoized) by combining the search query and date filter against the full
  history array — fine at the data volumes a single estate's visit history
  would realistically have, but worth knowing if this ever needs to scale to
  a much larger history list.
- **`VisitDetails.tsx`** seeds its local state (`approvalStatus`,
  `departureConfirmed`, `visitStatus`, `timeLeft`) from navigation params on
  mount and updates it optimistically after each action call
  (approve/disapprove/confirm-departure) rather than re-fetching — the screen
  never calls a GET after a mutation; it trusts its own local state update to
  reflect the new server state.

## Refresh-on-focus

`Home.tsx` refetches visit history via `useFocusEffect` — same pattern as the
resident app — so returning from `VisitDetails.tsx` after an action picks up
the change.
