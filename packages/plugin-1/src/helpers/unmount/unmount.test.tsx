import * as React from "react";

import { render } from "../render";
import { unmount } from "./unmount";

describe("unmount", () => {
    it("unmount from element", () => {
        const div = document.createElement("div");
        render(<span></span>, div);
        expect(unmount(div)).toBe(true);
    });

    it("unmount from null", () => {
        expect(unmount(null as any)).toBe(false);
    });
})