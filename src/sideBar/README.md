# Nuxtr sidebar

Vue sidebar packaged into the extension's `out/sidebar` directory. Host requests use `src/core/messages.ts`; the extension validates them before project actions. Network refreshes run in the host and retain cached/offline catalogue data.

Use `pnpm build` or `pnpm dev` from the repository root. Run `pnpm typecheck:ui` and `pnpm test:sidebar` to validate it. See [contributor guidance](../../CONTRIBUTING.md) for browser setup and the complete merge gate.
