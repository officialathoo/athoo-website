# Mobile CTA final fix

This package fixes the actual deployed source path and the root duplicate source path.

Files updated in BOTH locations:
- src/lib/navigation.ts
- src/components/layout/MobileBottomBar.tsx
- src/pages/home.tsx
- src/pages/become-provider.tsx
- artifacts/athoo/src/lib/navigation.ts
- artifacts/athoo/src/components/layout/MobileBottomBar.tsx
- artifacts/athoo/src/pages/home.tsx
- artifacts/athoo/src/pages/become-provider.tsx

What changed:
- Mobile bottom CTA now uses real <button> elements, not <a> links.
- Buttons listen on pointer/touch/click so iPhone Safari taps do not become inactive.
- Every click generates a unique URL timestamp, so repeated taps never become a same-route no-op.
- Join Waitlist always goes to /?cta=waitlist&ts=...#waitlist.
- Become Provider always goes to /become-provider?cta=provider&ts=...#provider-form.
- Home page scrolls to waitlist section when cta/hash is present.
- Provider page scrolls to provider form when cta/hash is present.
- Backend/API/admin files were not changed.

Important:
- Deploy without cache.
- Test on iPhone Safari after clearing website data or opening private/incognito mode.
