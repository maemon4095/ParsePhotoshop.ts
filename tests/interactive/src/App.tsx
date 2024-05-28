import { h } from "./deps/preact.ts";
import { createSwitcher } from "jsr:@maemon4095/preact-switcher";
import Home from "./pages/Home.tsx";
import View from "./pages/View.tsx";
const [Switcher, switcher] = createSwitcher({
  "home": Home,
  "view": View,
});
export { switcher };

export default function App() {
  return h(Switcher, { path: "home" });
}
