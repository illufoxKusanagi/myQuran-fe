// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";

// Import your page components
import HomeView from "../views/HomeView.vue";
import SurahView from "../views/SurahView.vue";
import HadithBooksView from "../views/hadith/HadithBooksView.vue";
import HadithListView from "../views/hadith/HadithListView.vue";
import HadithDetailView from "../views/hadith/HadithDetailView.vue";

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
    { path: "/hadith", name: "hadith-books", component: HadithBooksView },
    { path: "/hadith/:book", name: "hadith-list", component: HadithListView },
    { path: "/hadith/:book/:number", name: "hadith-detail", component: HadithDetailView },
  ],
});

export default router;
