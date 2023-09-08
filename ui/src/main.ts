import { createApp } from "vue";
import "./assets/main.css";
import App from "./App.vue";
import { provideVSCodeDesignSystem } from "@vscode/webview-ui-toolkit";
import { createNitroRouter, createWebHistory } from "vue-router";
import routes from "./router";

const router = createNitroRouter({
  history: createWebHistory(),
  routes,
});

provideVSCodeDesignSystem().register();
createApp(App).use(router).mount("#app");
