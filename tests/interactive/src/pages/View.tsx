import { h, VNode } from "../deps/preact.ts";
import {
  useEffect,
  useReducer,
  useRef,
  useState,
} from "../deps/preact/hooks.ts";
import {
  constructPhotoshopStructureFrom,
  Group,
  Layer,
  Photoshop,
} from "../deps/structure.ts";
import parsePhotoshopFile from "../deps/parse.ts";
import { renderSync } from "../deps/draw.ts";
import { PhotoshopFile } from "../deps/parse.ts";
import { PhotoshopNode } from "../deps/structure.ts";
export default function View({ file }: { file: File }) {
  const ps = useRef<{ file: PhotoshopFile; structure: Photoshop }>();
  const [version, setVersion] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onResize = () => {
    const canvas = canvasRef.current!;
    const container = canvas.parentElement!;
    const isCanvasVerticallyLong = (canvas.height / canvas.width) >
      (container.clientHeight / container.clientWidth);
    const scale = isCanvasVerticallyLong
      ? container.clientHeight / canvas.height
      : container.clientWidth / canvas.width;

    const posX = (container.clientWidth - canvas.width * scale) * 0.5;
    const posY = (container.clientHeight - canvas.height * scale) * 0.5;
    canvas.style.top = `${posY}px`;
    canvas.style.left = `${posX}px`;
    canvas.style.transform = `scale(${scale})`;
  };

  useEffect(() => {
    (async () => {
      const buffer = await file.arrayBuffer();
      const psf = parsePhotoshopFile(buffer);
      const structure = constructPhotoshopStructureFrom(psf);
      ps.current = { file: psf, structure };
      setVersion((t) => t + 1);
    })();
  }, []);
  useEffect(() => {
    self.addEventListener("resize", onResize);
    return () => {
      self.removeEventListener("resize", onResize);
    };
  });

  useEffect(() => {
    if (!ps.current) return;
    const canvas = canvasRef.current!;
    canvas.width = ps.current.structure.width;
    canvas.height = ps.current.structure.height;
    const imageData = renderSync(ps.current.structure);
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);
    onResize();
  }, [version]);

  return (
    h(
      "div",
      {
        class: "flex",
        style: "flex-direction: column; width: 100%; height: 100%;",
      },
      h("span", null, file.name),
      h(
        "div",
        {
          style:
            "flex: 1; display: flex; flex-direction: row; overflow:hidden;",
        },
        h(
          "div",
          { style: "overflow: auto;" },
          !!(ps.current) &&
            h(Structure, {
              node: ps.current.structure,
              onupdate: () => setVersion((t) => t + 1),
            }),
        ),
        h(
          "div",
          {
            class: "bg-blank",
            style:
              "flex: 1; min-width: 0; min-height: 0; overflow: hidden; transform: scale(1);",
          },
          h("canvas", {
            ref: canvasRef,
            style: "position: absolute; transform-origin: top left;",
          }),
        ),
      ),
    )
  );
}

type Callbacks = {
  onupdate: () => void;
};

function Structure(
  { node, onupdate }: {
    node: PhotoshopNode;
  } & Callbacks,
  // deno-lint-ignore no-explicit-any
): VNode<any> {
  switch (node.type) {
    case "Layer":
      return h(LayerEntry, { node, onupdate });
    case "Group":
      return h(GroupEntry, { node, onupdate });
    case "Photoshop":
      return h(
        "ul",
        {},
        node.children.map((e) => (
          h(Structure, { node: e, onupdate })
        )),
      );
  }
}

function LayerEntry({ node, onupdate }: { node: Layer } & Callbacks) {
  const [visible, toggleVisible] = useReducer(
    (old: boolean, e: void): boolean => {
      node.visible = !old;
      onupdate();
      return !old;
    },
    node.visible,
  );
  return h("li", {
    class: "ps-structure-node",
    "data-visible": visible,
    onClick: () => toggleVisible(),
  }, node.name);
}

function GroupEntry({ node, onupdate }: { node: Group } & Callbacks) {
  const [visible, toggleVisible] = useReducer(
    (old: boolean, e: void): boolean => {
      node.visible = !old;
      onupdate();
      return !old;
    },
    node.visible,
  );

  return (
    h(
      "li",
      {
        class: "ps-structure-node",
        "data-visible": visible,
      },
      h("span", {
        onClick: () => toggleVisible(),
      }, node.name),
      h(
        "ul",
        null,
        node.children.map((e) => (h(Structure, { node: e, onupdate }))),
      ),
    )
  );
}
