import * as parse5 from "parse5";
import type { FlintRouteContext } from "@flint/framework";
import { escape } from "@std/html/entities";

type Tags = { html: Array<string>; svg: Array<string>; math: Array<string> };

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
  const tags: Tags = {
    html: [],
    svg: [],
    math: [],
  };
  const children = nodeify(parsed.childNodes, tags);

  let result: string = "";

  for (const key of ["html", "svg", "math"]) {
    if (tags[key as keyof Tags].length) {
      result += `const {${
        [...new Set(tags[key as keyof Tags])].join(", ")
      }} = h.${key};\n\n`;
    }
  }

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

function nodeify(
  children: Array<parse5.DefaultTreeAdapterMap["childNode"]>,
  tags: Tags,
): Array<string> {
  const result = [];

  for (const child of children) {
    if (child.nodeName === "#text") {
      result.push(
        JSON.stringify(
          escape((child as parse5.DefaultTreeAdapterMap["textNode"]).value),
        ),
      );
    } else {
      const element = child as parse5.DefaultTreeAdapterMap["element"];
      const children = nodeify(element.childNodes ?? [], tags);
      let subresult = "";
      const namespaces = {
        html: "1999/xhtml",
        svg: "2000/svg",
        math: "1998/Math/MathML",
      };

      for (const [key, value] of Object.entries(namespaces)) {
        if (element.namespaceURI.endsWith(value)) {
          tags[key as keyof Tags].push(element.nodeName);
        }
      }

      subresult += element.nodeName;
      subresult += element.attrs.map((
        attr,
      ) => "." + attr.name + "(" + JSON.stringify(escape(attr.value)) + ")")
        .join("");

      if (children.length) {
        subresult += "(" + children.join(", ") + ")";
      }

      result.push(subresult);
    }
  }

  return result;
}
