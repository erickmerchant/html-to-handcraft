import on from "@handcraft/lib/on";
import text from "@handcraft/lib/text";
import { watch } from "@handcraft/lib/reactivity";
import { $ } from "@handcraft/lib/dollar";

const model = watch({ value: "" });

$("#input")(
  on.input(async (ev: Event) => {
    try {
      const res = await fetch("/api.json", {
        method: "post",
        // @ts-ignore 18047
        body: ev.target.value,
      });
      model.value = await res.json();
    } catch (e) {
      console.error(e);
    }
  }),
);

$("#output")(text(() => model.value));

$("#copy")(
  on.click(async () => {
    try {
      await navigator.clipboard.writeText(model.value);
    } catch (e) {
      console.error(e);
    }
  }),
);
