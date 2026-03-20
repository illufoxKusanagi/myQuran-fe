// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";

// Import your page components
import HomeView from "../views/HomeView.vue";
import SurahView from "../views/SurahView.vue";

export const router = createRouter({
  // This tells Vue to use the standard "History API" for the browser
  // so the URLs look normal (like /surah) instead of weird hashes (like /#/surah)
  history: createWebHistory(import.meta.env.BASE_URL),

  // This is the brain of the router. It connects paths to components.
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      // You can define dynamic variables in the path using a colon (:)
      path: "/surah/:id",
      name: "surah",
      component: SurahView,
    },
  ],
});

export default router;
