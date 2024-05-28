import { h } from "../deps/preact.ts";
import { switcher } from "../App.tsx";
export default function Home() {
  return h("input", {
    type: "file",
    onInput: (e) => {
      const files = e.currentTarget.files;
      if (files === null || files.length === 0) {
        return;
      }
      switcher.switch("view", { file: files[0] });
    },
  });
}
