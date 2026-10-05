import { h } from "@handcraft/lib";

const {
  html,
  head,
  meta,
  title,
  body,
  link,
  script,
  div,
  label,
  textarea,
  output,
  h1,
  button,
  main,
} = h.html;

export default function () {
  return html.lang("en-US")(
    head(
      meta.charset("utf-8"),
      meta
        .name("viewport")
        .content(
          "width=device-width",
        ),
      link.rel("stylesheet").href("/styles.css"),
      script.type("module").src("/script.js"),
      title("html to handcraft conversion tool"),
    ),
    body(
      main(
        h1("html to handcraft conversion tool"),
        div(
          label.for("html")("html"),
          textarea.id("html")(`<div class="test">Test 1 2 3</div>`),
        ),
        div(
          label.for("output")("output"),
          output
            .id("output")
            .for("html")(
              `div.class("test")("Test 1 2 3")`,
            ),
          button("copy"),
        ),
      ),
    ),
  );
}
