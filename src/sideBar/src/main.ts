import { createApp } from "vue";
import "./assets/main.css";
import App from "./App.vue";
import { provideVSCodeDesignSystem } from "@vscode/webview-ui-toolkit";
import { createRouter, createWebHistory } from "vue-router";
import routes from "./router";

const router = createRouter({
    history: createWebHistory(),
    routes,
});

provideVSCodeDesignSystem().register();
createApp(App).use(router).mount("#app");
