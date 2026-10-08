import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import json from "@flint/framework/handlers/json";
import flint from "@flint/framework";
import { view } from "@handcraft/lib/ssr";
import page from "./page.ts";
import api from "./api.ts";

const app = flint()
  .route("/", view(page))
  .route("/api.json", json.post(api), [])
  .file("/script.js", js)
  .file("/styles.css", css);

export default app;

if (import.meta.main) {
  app.run();
}
