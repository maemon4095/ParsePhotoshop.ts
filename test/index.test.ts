import { parse } from "~/mod.ts";
const test_file = Deno.env.get("TEST_FILE")!;
const file = await Deno.readFile(test_file);
parse(file.buffer);
function createMarkerDecorator(): (...args: any) => any {
    return (..._args) => { };
}

const a = createMarkerDecorator();

@a("aa")
class A {

    @a
    method() {

    }
}

class C {
    method() {
        @a()
        class D {

        }
    }
}


function x() {
    @a
    class B {

    }
}
