/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import App from './App.vue';
import Home from './views/Home.vue';
import Settings from './views/Settings.vue';
import Conversation from './views/Conversation.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/conversation', component: Conversation },
  { path: '/settings', component: Settings },
]
const router = createRouter({
  history: createMemoryHistory(),
  routes
})

const app = createApp(App);
app.use(router);
app.mount('#app');
