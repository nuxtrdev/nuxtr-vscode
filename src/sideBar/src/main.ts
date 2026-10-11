/** Mount the Vue sidebar with in-memory navigation suitable for a VS Code webview. */
import { createApp } from 'vue';
import './assets/main.css';
import App from './App.vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import routes from './router';

const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

createApp(App).use(router).mount('#app');
