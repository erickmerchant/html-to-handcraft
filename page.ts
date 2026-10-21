import attr from "@handcraft/lib/attr";
import text from "@handcraft/lib/text";
import { html } from "@handcraft/lib/h";

export default function () {
  return html.html(
    attr.lang("en-US"),
    html.head(
      html.meta(attr.charset("utf-8")),
      html.meta(
        attr.name("viewport"),
        attr.content(
          "width=device-width",
        ),
      ),
      html.link(attr.rel("stylesheet"), attr.href("/styles.css")),
      html.script(attr.type("module"), attr.src("/script.js")),
      html.title(text("html to handcraft conversion tool")),
    ),
    html.body(
      html.main(
        html.h1(text("html to handcraft conversion tool")),
        html.div(
          html.label(attr.for("input"), text("input")),
          html.textarea(attr.id("input")),
          html.div(
            html.label(attr.for("output"), text("output")),
            html.output(attr.id("output"), attr.for("input")),
            html.button(attr.id("copy"), text("copy")),
          ),
        ),
      ),
    ),
  );
}
