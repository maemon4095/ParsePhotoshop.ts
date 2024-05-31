import { Blender } from "jsr:@maemon4095/imagedata-blender-gl@0.1";
import { blendLayerTo, Request, Response } from "./util.ts";

let blender: Blender;
onmessage = (e: MessageEvent<Request>) => {
    switch (e.data.type) {
        case "init": {
            blender = new Blender(e.data.width, e.data.height);
            break;
        }
        case "blend": {
            blendLayerTo(blender, e.data.layer, 0, 0);
            break;
        }
        case "complete": {
            const data = blender.createImageData();
            blender.cleanUp();
            const message: Response = {
                type: "done",
                data
            };
            postMessage(message);
            break;
        }
        default: {
            console.log(e.data);
            throw new Error("Unrecognized request.");
        }
    }
};


