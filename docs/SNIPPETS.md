# Nuxt and H3 snippets

Catalogue reviewed against the official API references on **2026-10-10**. Nuxt coverage includes every entry in the [Nuxt 4 API index](https://nuxt.com/docs/4.x/api): 16 components, 33 composables and 31 utilities, plus five helpers described within those pages.

Type a listed name and choose the **Nuxtr** suggestion, then use Tab to move through editable values. Existing prefixes remain available. Components also have lower-case-leading aliases such as `nuxtPage`, `clientOnly` and `nuxtTeleport`. `$fetch` retains `fetch`.

Component suggestions appear in Vue templates and HTML; composables/utilities appear in JavaScript, TypeScript and Vue script blocks. The provider hides version-limited APIs when the selected project’s declared Nuxt version is too old or unresolved. Nuxt Image and experimental feature requirements are shown in descriptions; selecting a snippet does not install modules or enable features.

The `createUseFetch`/`createUseAsyncData` snippets belong in an exported composable file. Plugin and route middleware templates belong in their respective directories; `defineNuxtComponent` belongs in a normal script block. `definePageMeta` and `defineRouteRules` belong at the top level of a page’s script setup block. Fetch interceptor snippets (`onRequest`, etc.) belong inside a fetch options object.

## Components

| API | Requirement | Reference |
|---|---|---|
| `ClientOnly` | — | [Docs](https://nuxt.com/docs/4.x/api/components/client-only) |
| `DevOnly` | — | [Docs](https://nuxt.com/docs/4.x/api/components/dev-only) |
| `NuxtClientFallback` | `experimental.clientFallback` | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-client-fallback) |
| `NuxtPage` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-page) |
| `NuxtLayout` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-layout) |
| `NuxtLink` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-link) |
| `NuxtLoadingIndicator` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-loading-indicator) |
| `NuxtErrorBoundary` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-error-boundary) |
| `NuxtWelcome` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-welcome) |
| `NuxtIsland` | `experimental.componentIslands`; matching server component | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-island) |
| `NuxtImg` | `@nuxt/image` module | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-img) |
| `NuxtPicture` | `@nuxt/image` module | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-picture) |
| `Teleport` | — | [Docs](https://nuxt.com/docs/4.x/api/components/teleports) |
| `NuxtRouteAnnouncer` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-route-announcer) |
| `NuxtTime` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-time) |
| `NuxtAnnouncer` | Nuxt 4.4.2+ | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-announcer) |

## Composables

| API | Requirement | Reference |
|---|---|---|
| `useAppConfig` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-app-config) |
| `useAsyncData` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-async-data) |
| `useCookie` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-cookie) |
| `useError` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-error) |
| `useFetch` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-fetch) |
| `useHeadSafe` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-head-safe) |
| `useHead` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-head) |
| `useHydration` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-hydration) |
| `useLazyAsyncData` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-lazy-async-data) |
| `useLazyFetch` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-lazy-fetch) |
| `useNuxtApp` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-nuxt-app) |
| `useNuxtData` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-nuxt-data) |
| `useRequestEvent` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-request-event) |
| `useRequestHeaders` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-request-headers) |
| `useRequestURL` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-request-url) |
| `useRoute` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-route) |
| `useRouter` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-router) |
| `useRuntimeConfig` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-runtime-config) |
| `useSeoMeta` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-seo-meta) |
| `useServerSeoMeta` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-server-seo-meta) |
| `useState` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-state) |
| `createUseAsyncData` | Nuxt 4.4.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/create-use-async-data) |
| `createUseFetch` | Nuxt 4.4.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/create-use-fetch) |
| `onPrehydrate` | Nuxt 3.12.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/on-prehydrate) |
| `useAnnouncer` | Nuxt 4.4.2+ | [Docs](https://nuxt.com/docs/4.x/api/composables/use-announcer) |
| `useLayout` | Nuxt 4.5.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/use-layout) |
| `useLoadingIndicator` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-loading-indicator) |
| `usePreviewMode` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-preview-mode) |
| `useRequestFetch` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-request-fetch) |
| `useRequestHeader` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-request-header) |
| `useResponseHeader` | Nuxt 3.14.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/use-response-header) |
| `useRouteAnnouncer` | — | [Docs](https://nuxt.com/docs/4.x/api/composables/use-route-announcer) |
| `useRuntimeHook` | Nuxt 3.14.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/use-runtime-hook) |
| `tryUseNuxtApp` | Nuxt 3.10.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/use-nuxt-app#tryusenuxtapp) |

## Utils

| API | Requirement | Reference |
|---|---|---|
| `$fetch` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/dollarfetch) |
| `abortNavigation` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/abort-navigation) |
| `addRouteMiddleware` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/add-route-middleware) |
| `clearError` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/clear-error) |
| `clearNuxtData` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/clear-nuxt-data) |
| `createError` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/create-error) |
| `defineNuxtComponent` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/define-nuxt-component) |
| `defineNuxtRouteMiddleware` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/define-nuxt-route-middleware) |
| `definePageMeta` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/define-page-meta) |
| `navigateTo` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/navigate-to) |
| `onBeforeRouteLeave` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/on-before-route-leave) |
| `onBeforeRouteUpdate` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/on-before-route-update) |
| `onNuxtReady` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/on-nuxt-ready) |
| `prefetchComponents` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/prefetch-components) |
| `preloadComponents` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/preload-components) |
| `preloadRouteComponents` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/preload-route-components) |
| `refreshNuxtData` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/refresh-nuxt-data) |
| `reloadNuxtApp` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/reload-nuxt-app) |
| `setPageLayout` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/set-page-layout) |
| `setResponseStatus` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/set-response-status) |
| `showError` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/show-error) |
| `updateAppConfig` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/update-app-config) |
| `callOnce` | Nuxt 3.9.0+ | [Docs](https://nuxt.com/docs/4.x/api/utils/call-once) |
| `clearNuxtState` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/clear-nuxt-state) |
| `defineLazyHydrationComponent` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/define-lazy-hydration-component) |
| `defineNuxtPlugin` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/define-nuxt-plugin) |
| `defineRouteRules` | `experimental.inlineRouteRules` | [Docs](https://nuxt.com/docs/4.x/api/utils/define-route-rules) |
| `defineUseAsyncDataAddon` | Nuxt 4.6.0+ | [Docs](https://nuxt.com/docs/4.x/api/utils/define-use-async-data-addon) |
| `defineUseFetchAddon` | Nuxt 4.6.0+ | [Docs](https://nuxt.com/docs/4.x/api/utils/define-use-fetch-addon) |
| `prerenderRoutes` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/prerender-routes) |
| `refreshCookie` | — | [Docs](https://nuxt.com/docs/4.x/api/utils/refresh-cookie) |
| `definePayloadPlugin` | Nuxt 3.4.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/use-nuxt-app#payload) |
| `definePayloadReducer` | Nuxt 3.4.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/use-nuxt-app#payload) |
| `definePayloadReviver` | Nuxt 3.4.0+ | [Docs](https://nuxt.com/docs/4.x/api/composables/use-nuxt-app#payload) |
| `defineNuxtLink` | — | [Docs](https://nuxt.com/docs/4.x/api/components/nuxt-link#definenuxtlink-signature) |

## H3 v1 server helpers

All 72 helpers from the [request](https://v1.h3.dev/utils/request), [response](https://v1.h3.dev/utils/response) and [advanced](https://v1.h3.dev/utils/advanced) references are available in JavaScript/TypeScript files inside the resolved server directory, including custom `serverDir` layouts. Type the exact helper name or an explicit alias such as `h3ReadBody`, `h3SetCookie` or `h3CreateEventStream`. Vue templates and application files do not receive this set.

These templates target **Nitro 2 / H3 v1**, using its server auto-imports. H3 v2 APIs are not covered. Session helpers require a private `runtimeConfig.sessionPassword` string of at least 32 characters; supply it through private runtime configuration rather than public config. Replace placeholder origins, URLs, validation predicates and cookie options to match your application.

### Request

`assertMethod` · `getHeader` · `getHeaders` · `getQuery` · `getRequestHeader` · `getRequestHeaders` · `getRequestHost` · `getRequestIP` · `getRequestProtocol` · `getRequestURL` · `getRouterParam` · `getRouterParams` · `getValidatedQuery` · `getValidatedRouterParams` · `isMethod` · `toWebRequest` · `getRequestFingerprint` · `getRequestWebStream` · `readBody` · `readFormData` · `readMultipartFormData` · `readRawBody` · `readValidatedBody`

### Response

`appendHeader` · `appendHeaders` · `appendResponseHeader` · `appendResponseHeaders` · `clearResponseHeaders` · `defaultContentType` · `getResponseHeader` · `getResponseHeaders` · `getResponseStatus` · `getResponseStatusText` · `isStream` · `isWebResponse` · `removeResponseHeader` · `send` · `sendIterable` · `sendNoContent` · `sendRedirect` · `sendStream` · `sendWebResponse` · `setHeader` · `setHeaders` · `setResponseHeader` · `setResponseHeaders` · `setResponseStatus` · `writeEarlyHints`

### Advanced

`clearSession` · `getSession` · `sealSession` · `unsealSession` · `updateSession` · `useSession` · `deleteCookie` · `getCookie` · `parseCookies` · `setCookie` · `sanitizeStatusCode` · `sanitizeStatusMessage` · `useBase` · `handleCacheHeaders` · `fetchWithEvent` · `getProxyRequestHeaders` · `proxyRequest` · `sendProxy` · `appendCorsHeaders` · `appendCorsPreflightHeaders` · `handleCors` · `isCorsOriginAllowed` · `isPreflightRequest` · `createEventStream`

## Toggles and local verification

Use `nuxtr.snippets.nuxt` and `nuxtr.snippets.nitro` to enable or disable the corresponding suggestions without reloading. Suggestions are suppressed inside unfinished import statements. Installed extension manifests are never edited.

For local extension testing, run `pnpm build`, launch **Run Extension** with F5, and open a Nuxt app in the Extension Development Host. Try `NuxtPage` in a Vue template, `useHydration` in its script block and `h3ReadBody` under `server/api/` (or your configured server directory). Alternatively install the locally packaged VSIX and run **Developer: Reload Window**.

`pnpm validate` checks provider behavior, resource packaging and activation in both development and extracted VSIX hosts. `pnpm test:fixtures` additionally compiles every applicable documented snippet against pinned Nuxt 3/4 projects with Nuxt Image and required experimental flags enabled. The fixture expressions are compiled without executing their fetch/session/proxy examples.
