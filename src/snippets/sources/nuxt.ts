import type { Snippet } from "../../types";

const composables: Record<string, Snippet> = {
    "useAppConfig": {
        "prefix": "useAppConfig",
        "body": [
            "const appConfig = useAppConfig();"
        ],
        "description": "useAppConfig"
    },
    "useAsyncData": {
        "prefix": "useAsyncData",
        "body": [
            "const { data, pending, error, refresh } = await useAsyncData(",
            "    '$2',",
            "    () => \\$fetch('$3')",
            ");"
        ],
        "description": "useAsyncData"
    },
    "useCookie": {
        "prefix": "useCookie",
        "body": [
            "const ${1:cookie} = useCookie('$2'${3:, })"
        ],
        "description": "useCookie"
    },
    "getCookie": {
        "prefix": "getCookie",
        "body": [
            "const ${1:cookie} = getCookie('$2'${3:, })"
        ],
        "description": "getCookie"
    },
    "setCookie": {
        "prefix": "setCookie",
        "body": [
            "setCookie('$1'${2:, })"
        ],
        "description": "setCookie"
    },
    "useError": {
        "prefix": "useError",
        "body": [
            "const ${1:error} = useError()"
        ],
        "description": "useError"
    },
    "useFetch": {
        "prefix": "useFetch",
        "body": [
            "const { data, pending, error, refresh } = await useFetch('$1',{",
            "    $2",
            "})"
        ],
        "description": "useFetch"
    },
    "onRequest": {
        "prefix": "onRequest",
        "body": [
            "onRequest({ request, options }) {",
            "    $1",
            "}"
        ],
        "description": "onRequest"
    },
    "onRequestError": {
        "prefix": "onRequestError",
        "body": [
            "onRequestError({ request, options, error }) {",
            "    $1",
            "}"
        ],
        "description": "onRequestError"
    },
    "onResponse": {
        "prefix": "onResponse",
        "body": [
            "onResponse({ request, response, options }) {",
            "    $1",
            "}"
        ],
        "description": "onResponse"
    },
    "onResponseError": {
        "prefix": "onResponseError",
        "body": [
            "onResponseError({ request, response, options }) {",
            "    $1",
            "}"
        ],
        "description": "onResponseError"
    },
    "useHeadSafe": {
        "prefix": "useHeadSafe",
        "body": [
            "useHeadSafe({",
            "    $1",
            "});"
        ],
        "description": "useHeadSafe"
    },
    "useHead": {
        "prefix": "useHead",
        "body": [
            "useHead({",
            "  $1",
            "})"
        ],
        "description": "useHead"
    },
    "useHydration": {
        "prefix": "useHydration",
        "body": [
            "useHydration({",
            "  $1",
            "})"
        ],
        "description": "useHydration"
    },
    "useLazyAsyncData": {
        "prefix": "useLazyAsyncData",
        "body": [
            "const { $1 } = await useLazyAsyncData('$2', () => \\$fetch('$3'))"
        ],
        "description": "useLazyAsyncData"
    },
    "useLazyFetch": {
        "prefix": "useLazyFetch",
        "body": [
            "const { $1 } = await useLazyFetch('$3')"
        ],
        "description": "useLazyFetch"
    },
    "useNuxtApp": {
        "prefix": "useNuxtApp",
        "body": [
            "const nuxtApp = useNuxtApp()",
            ""
        ],
        "description": "useNuxtApp"
    },
    "useNuxtData": {
        "prefix": "useNuxtData",
        "body": [
            "const { data: $1 } = useNuxtData('$2')"
        ],
        "description": "useNuxtData"
    },
    "useRequestEvent": {
        "prefix": "useRequestEvent",
        "body": [
            "const event = useRequestEvent()"
        ],
        "description": "useRequestEvent"
    },
    "useRequestHeaders": {
        "prefix": "useRequestHeaders",
        "body": [
            "const headers = useRequestHeaders($1)"
        ],
        "description": "useRequestHeaders"
    },
    "useRequestURL": {
        "prefix": "useRequestURL",
        "body": [
            "const url = useRequestURL()"
        ],
        "description": "useRequestURL"
    },
    "useRoute": {
        "prefix": "useRoute",
        "body": [
            "const route = useRoute();"
        ],
        "description": "useRoute"
    },
    "useRouter": {
        "prefix": "useRouter",
        "body": [
            "const router = useRouter();"
        ],
        "description": "useRouter"
    },
    "useRuntimeConfig": {
        "prefix": "useRuntimeConfig",
        "body": [
            "const config = useRuntimeConfig()"
        ],
        "description": "useRuntimeConfig"
    },
    "useSeoMeta": {
        "prefix": "useSeoMeta",
        "body": [
            "useSeoMeta({",
            "  $1",
            "})"
        ],
        "description": "useSeoMeta"
    },
    "useServerSeoMeta": {
        "prefix": "useServerSeoMeta",
        "body": [
            "useServerSeoMeta({",
            "  $1",
            "})"
        ],
        "description": "useServerSeoMeta"
    },
    "useState": {
        "prefix": "useState",
        "body": [
            "const $1 = useState('$2', () => $3)"
        ],
        "description": "useState"
    }
};


const utils: Record<string, Snippet> = {
    "$fetch": {
        "prefix": "fetch",
        "body": [
            "const $1 = await \\$fetch('$2')"
        ],
        "description": "$fetch"
    },
    "abortNavigation": {
        "prefix": "abortNavigation()",
        "body": [
            "abortNavigation($1)"
        ],
        "description": "abortNavigation"
    },
    "addRouteMiddleware": {
        "prefix": "addRouteMiddleware",
        "body": [
            "addRouteMiddleware('$1', (${2:to, from}) => {",
            "    $3",
            "}, { global: true })"
        ],
        "description": "addRouteMiddleware"
    },
    "clearError": {
        "prefix": "clearError",
        "body": [
            "clearError($1)"
        ],
        "description": "clearError"
    },
    "clearNuxtData": {
        "prefix": "clearNuxtData",
        "body": [
            "clearNuxtData($1)"
        ],
        "description": "clearNuxtData"
    },
    "createError": {
        "prefix": "createError",
        "body": [
            "throw createError({",
            "    statusCode: $1,",
            "    statusMessage: '$2'",
            "})"
        ],
        "description": "createError"
    },
    "defineNuxtComponent": {
        "prefix": "defineNuxtComponent",
        "body": [
            "export default defineNuxtComponent({",
            "$1",
            "})"
        ],
        "description": "defineNuxtComponent"
    },
    "defineNuxtRouteMiddleware": {
        "prefix": "defineNuxtRouteMiddleware",
        "body": [
            "export default defineNuxtRouteMiddleware((${1:to, from}) => {",
            "   $2",
            "})",
            ""
        ],
        "description": "defineNuxtRouteMiddleware"
    },
    "definePageMeta": {
        "prefix": "definePageMeta",
        "body": [
            "definePageMeta({",
            "    $1",
            "})"
        ],
        "description": "definePageMeta"
    },
    "navigateTo": {
        "prefix": "navigateTo",
        "body": [
            "navigateTo('$1', $2)"
        ],
        "description": "navigateTo"
    },
    "onBeforeRouteLeave": {
        "prefix": "onBeforeRouteLeave",
        "body": [
            "onBeforeRouteLeave($1)"
        ],
        "description": "onBeforeRouteLeave"
    },
    "onBeforeRouteUpdate": {
        "prefix": "onBeforeRouteUpdate",
        "body": [
            "onBeforeRouteUpdate($1)"
        ],
        "description": "onBeforeRouteUpdate"
    },
    "onNuxtReady": {
        "prefix": "onNuxtReady",
        "body": [
            "onNuxtReady(async () => {",
            "    $1",
            "})"
        ],
        "description": "onNuxtReady"
    },
    "prefetchComponents": {
        "prefix": "prefetchComponents",
        "body": [
            "prefetchComponents('$1')"
        ],
        "description": "prefetchComponents"
    },
    "preloadComponents": {
        "prefix": "preloadComponents",
        "body": [
            "preloadComponents('$1')"
        ],
        "description": "preloadComponents"
    },
    "preloadRouteComponents": {
        "prefix": "preloadRouteComponents",
        "body": [
            "preloadRouteComponents('$1')"
        ],
        "description": "preloadRouteComponents"
    },
    "refreshNuxtData": {
        "prefix": "refreshNuxtData",
        "body": [
            "refreshNuxtData('$1')"
        ],
        "description": "refreshNuxtData"
    },
    "reloadNuxtApp": {
        "prefix": "reloadNuxtApp",
        "body": [
            "reloadNuxtApp('$1')"
        ],
        "description": "reloadNuxtApp"
    },
    "setPageLayout": {
        "prefix": "setPageLayout",
        "body": [
            "setPageLayout('$1')"
        ],
        "description": "setPageLayout"
    },
    "setResponseStatus": {
        "prefix": "setResponseStatus",
        "body": [
            "setResponseStatus('$1:event', $2:404, ${3: '${4:'Message'}'})"
        ],
        "description": "setResponseStatus"
    },
    "showError": {
        "prefix": "showError",
        "body": [
            "showError({ statusCode: $1, statusMessage: \"$2\" })"
        ],
        "description": "showError"
    },
    "updateAppConfig": {
        "prefix": "updateAppConfig",
        "body": [
            "const ${1:newAppConfig} = { $2 }",
            "updateAppConfig($1)"
        ],
        "description": "updateAppConfig"
    }
}


const tags: Record<string, Snippet> = {
    "template": {
        "prefix": "template",
        "body": ["<template>", "", "</template>"],
        "description": "template tag"
    },
    "setupJSScriptTag": {
        "prefix": "setupjscript",
        "body": ["<script setup>", "", "</script>"],
        "description": "JavaScript setup script tag"
    },
    "setupTSScriptTag": {
        "prefix": "setuptscript",
        "body": ["<script lang=\"ts\" setup>", "", "</script>"],
        "description": "JavaScript setup script tag"
    },
    "scriptJSTag": {
        "prefix": "scriptjs",
        "body": ["<script>", "", "</script>"],
        "description": "script tag"
    },
    "scriptTSTag": {
        "prefix": "scriptts",
        "body": ["<script lang=\"ts\">", "", "</script>"],
        "description": "script tag"
    },
    "styleTag": {
        "prefix": "style",
        "body": ["<style>", "", "</style>"],
        "description": "style tag"
    }
}


const components: Record<string, Snippet> = {
    "Nuxt | NuxtLink": {
        "prefix": "nuxtLink",
        "body": [
            "<NuxtLink to=\"$1\">$2</NuxtLink>"
        ],
        "description": "Nuxt NuxtLink component."
    },
    "Nuxt | Teleport": {
        "prefix": "nuxtTeleport",
        "body": [
            "<Teleport to=\"$1\">$2</Teleport>"
        ],
        "description": "Nuxt Teleport component"
    },
    "Nuxt | NuxtLayout": {
        "prefix": "nuxtLayout",
        "body": [
            "<NuxtLayout $1>$2</NuxtLayout>"
        ],
        "description": "Nuxt | NuxtLayout"
    },
    "Nuxt | NuxtPage": {
        "prefix": "nuxtPage",
        "body": [
            "<NuxtPage $1/>"
        ],
        "description": "Nuxt | NuxtPage"
    },
    "Nuxt | NuxtWelcome": {
        "prefix": "nuxtWelcome",
        "body": [
            "<NuxtWelcome $1/>"
        ],
        "description": "NuxtWelcome Component"
    },
    "Nuxt | NuxtErrorBoundary": {
        "prefix": "nuxtErrorBoundary",
        "body": [
            "<NuxtErrorBoundary ${1:@error=\"$2\"}>",
            "$3",
            "</NuxtErrorBoundary>"
        ],
        "description": "Nuxt | NuxtErrorBoundary"
    },
    "Nuxt | Template with ID": {
        "prefix": "templateWithId",
        "body": [
            "<template #$1>",
            "  $2",
            "</template>"
        ],
        "description": "Nuxt | Template with ID"
    },
    "Nuxt | NuxtLoadingIndicator": {
        "prefix": "nuxtLoadingIndicator",
        "body": [
            "<NuxtLoadingIndicator $1/>"
        ],
        "description": "Nuxt | NuxtLoadingIndicator"
    },
    "Nuxt | ClientOnly": {
        "prefix": "clientonly",
        "body": [
            "<ClientOnly $1>",
            "  $2",
            "</ClientOnly>"
        ],
        "description": "Nuxt | NuxtPortal"
    },
    "Nuxt | NuxtClientFallback": {
        "prefix": "nuxtClientFallback",
        "body": [
            "<NuxtClientFallback $1>",
            "  $2",
            "</NuxtClientFallback>"
        ],
        "description": "Nuxt | NuxtClientFallback"
    },
    "Nuxt | fallback": {
        "prefix": "fallback",
        "body": [
            "fallback=\"$1\""
        ],
        "description": "Nuxt | fallback"
    },
    "Nuxt | fallbackTag": {
        "prefix": "fallbackTag",
        "body": [
            "fallback-tag=\"$1\""
        ],
        "description": "Nuxt | fallbackTag"
    },
    "Nuxt | SSR Error": {
        "prefix": "ssrError",
        "body": [
            " @ssr-error=\"$1\""
        ],
        "description": "Nuxt | SSR Error"
    },
    "Nuxt | name": {
        "prefix": "name",
        "body": [
            "name=\"$1\""
        ],
        "description": "Nuxt | name"
    },
    "Nuxt | pageKey": {
        "prefix": "pageKey",
        "body": [
            "page-key=\"$1\""
        ],
        "description": "Nuxt | pageKey"
    }
}

const nuxtSnippets = {
    composables,
    tags,
    components,
    utils
}

export default nuxtSnippets