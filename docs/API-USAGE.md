# Security App — API/SDK Usage

Same bypass pattern as the resident app: `src/lib/apiClient.ts` exports both
the typed `securityApi`/`authApi` facades and the raw `api` axios instance,
and every screen in this app uses the raw `api` export exclusively for
domain calls. Only `AuthContext.logout()` uses a typed method
(`authApi.logout()`).

## Call-site map

| Screen | Route(s) called | Via |
|---|---|---|
| `Login.tsx` | `POST /security_login` | raw `api` |
| `Home.tsx` | `GET /visitor-history`, `GET /verify-visitor-details/{code}`, `GET /security/visitor-details/{code}` | raw `api` |
| `VisitDetails.tsx` | `POST /security/approve-visitor/{code}`, `POST /disapprove-visitor/{code}`, `POST /security/confirm-departure/{code}` | raw `api` |
| `AuthContext.tsx` | `authApi.logout()` | **typed SDK method** |

## What is never called

`security.searchVisitor(query)` — the SDK method exists (`GET
/search-visitor`), but `Home.tsx`'s search box filters the already-fetched
`/visitor-history` result client-side instead. See `FEATURES.md`.

## Error handling

Same repeated inline pattern as every other app in this platform:

```ts
catch (err: any) {
  Alert.alert('Info', err?.response?.data?.detail || err?.response?.data?.message || 'Fallback text');
}
```

Notably this app uses `Alert.alert('Info', ...)` for both success and error
messages after mutation calls (approve/disapprove/confirm-departure), rather
than distinguishing success/error alert titles the way the resident app
generally does (`'Success'` vs `'Error'`) — a minor UX inconsistency, not a
functional bug.
