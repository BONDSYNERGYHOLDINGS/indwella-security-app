# Security App — Authentication

See `../AUTHENTICATION.md` for the platform-wide model. This app is the
simplest of the three: no email/password, no signup, no password reset —
just a per-estate code plus device identity.

## Login flow — `screens/security/Login.tsx`

1. Guard enters a **security code** (an admin generates this via
   `POST /generate-security-code` in admin-web; see
   `../admin/FEATURES.md` → Security).
2. On submit, the screen collects device metadata via
   `react-native-device-info`: `getUniqueId()`, `getDeviceName()`,
   `getBrand()`, `getModel()`, `getSystemName()`, `getSystemVersion()`.
3. Posts to `/security_login` with
   `{ code, device_id, device_name, device_brand, device_model, system_name, system_version }`
   — via raw `api.post`, not the SDK's typed `authApi.login()`.
4. On a response with `message === 'Login successful'` and a present
   `access_token`, calls `login(access_token, refresh_token)`. Any other
   shape shows an `Alert` with the backend's message.
5. On error, shows the backend's `detail`/`message`, falling back to
   "Invalid or expired code. Please try again."

There is no equivalent to the resident app's approval-gating logic — a
successful login here means the device is immediately usable; there's no
"pending" state for a security device to wait through.

## Token refresh

Same shared SDK mechanism as every other app — single-flight refresh against
`/auth/refresh`, `securityTokenStorage` persists the pair under
`security_token`/`security_refresh_token`.

## Logout

`AuthContext.logout()` calls `authApi.logout()` (the SDK's typed method — one
of the few places in this app that *does* use it), clears token storage,
flips `isAuthenticated`.

## What's notably absent

- No forgot-password/OTP/reset flow — none would make sense for a
  device-code model with no associated email.
- No account/profile screen — a security "session" is scoped to a device,
  not a person; there's nothing to edit.
- No password change screen — there's no password.
