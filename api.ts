import * as parse5 from "parse5";
import type { FlintRouteContext } from "@flint/framework";
import { escape } from "@std/html/entities";

const namespaces = {
  html: "1999/xhtml",
  svg: "2000/svg",
  math: "1998/Math/MathML",
};

export default async function (
  { request: req }: FlintRouteContext,
): Promise<string> {
  const html = new TextDecoder().decode(await req.arrayBuffer());

  return parse(html);
}

export async function parse(
  html: string,
): Promise<string> {
  const parsed = parse5.parseFragment(html.trim());
  const children = nodeify(parsed.childNodes);

  let result: string = "";

  if (children.length > 1) {
    result += "[" + children.join(", ") + "];";
  } else {
    result += children.join("");
  }

  const command = new Deno.Command("deno", {
    args: [
      "fmt",
      "--ext=ts",
      "-",
    ],
    stdin: "piped",
    stdout: "piped",
  });
  const process = command.spawn();
  const writer = process.stdin.getWriter();

  await writer.write(new TextEncoder().encode(result));

  writer.releaseLock();

  await process.stdin.close();

  const stdout = await process.stdout.text();

  return stdout;
}

function funcCall(proxy: string, name: string) {
  return proxy +
    (/^[a-zA-Z]+$/.test(name)
      ? `.${name}`
      : `[${JSON.stringify(escape(name))}]`);
}

function nodeify(
  children: Array<parse5.DefaultTreeAdapterMap["childNode"]>,
): Array<string> {
  const result = [];

  for (const child of children) {
    if (child.nodeName === "#text") {
      result.push(
        `text(${
          JSON.stringify(
            escape((child as parse5.DefaultTreeAdapterMap["textNode"]).value),
          )
        })`,
      );
    } else {
      const element = child as parse5.DefaultTreeAdapterMap["element"];
      const children = nodeify(element.childNodes ?? []);
      let subresult = "";
      let type = "html";

      for (const [key, value] of Object.entries(namespaces)) {
        if (element.namespaceURI.endsWith(value)) {
          type = key;
        }
      }

      subresult += funcCall(type, element.nodeName) + "(";
      subresult += element.attrs.map((attr) => {
        let result;

        if (attr.name.startsWith("aria-")) {
          result = funcCall("aria", attr.name.substring(5));
        } else if (attr.name.startsWith("data-")) {
          result = funcCall("data", attr.name.substring(5));
        } else {
          result = funcCall("attr", attr.name);
        }

        return result + "(" + JSON.stringify(escape(attr.value)) + ")";
      })
        .concat(children)
        .join(",");
      subresult += ")";

      result.push(subresult);
    }
  }

  return result;
}
