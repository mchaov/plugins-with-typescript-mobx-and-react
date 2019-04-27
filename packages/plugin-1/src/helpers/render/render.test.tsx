import * as React from "react";
import { render } from "./render";

describe("render", () => {
    it("render element", () => {
        const div = document.createElement("div");
        const comp = <span>test</span>;
        let a = render(comp, div, () => { });
        expect(a["toString"]()).toEqual("[object HTMLSpanElement]");
    })
})