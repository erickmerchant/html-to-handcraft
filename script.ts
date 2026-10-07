import { $, h, watch } from "@handcraft/lib";

const { pre } = h.html;

const text = watch({ value: "" });

$("#html").on("input", async (ev: Event) => {
  try {
    const res = await fetch("/api.json", {
      method: "post",
      // @ts-ignore 18047
      body: ev.target.value,
    });
    text.value = await res.json();
  } catch (e) {
    console.error(e);
  }
});

$("#output")(pre(() => text.value));

$("#copy").on("click", async () => {
  try {
    await navigator.clipboard.writeText(text.value);
  } catch (e) {
    console.error(e);
  }
});
