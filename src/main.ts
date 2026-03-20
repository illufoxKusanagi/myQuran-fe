import { createApp } from "vue";
import router from "./router";
import * as Sentry from "@sentry/vue";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://59668127a256a892abbbba9bb74b80c3@o4511063272390656.ingest.us.sentry.io/4511063279992832",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

app.use(router);
app.mount("#app");
