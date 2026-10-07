import * as parse5 from "parse5";
import type { FlintRouteContext } from "@flint/framework";
import { escape } from "@std/html/entities";

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

  let result: string;

  if (children.length > 1) {
    result = "[" + children.join(", ") + "]";
  } else {
    result = children.join("");
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
): Array<string> {
  const result = [];

  for (const child of children) {
    if (child.nodeName === "#text") {
      result.push(
        '"' +
          escape((child as parse5.DefaultTreeAdapterMap["textNode"]).value) +
          '"',
      );
    } else {
      const element = child as parse5.DefaultTreeAdapterMap["element"];
      // namespace: element.namespaceURI,
      const children = nodeify(element.childNodes ?? []);
      let subresult = "";

      subresult += element.nodeName;
      subresult += element.attrs.map((
        attr,
      ) => "." + attr.name + '("' + escape(attr.value) + '")').join("");

      if (children.length) {
        subresult += "(" + children.join(", ") + ")";
      }

      result.push(subresult);
    }
  }

  return result;
}
