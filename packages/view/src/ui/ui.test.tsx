import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { UIState } from "../state";
import { UI } from "./ui";

describe("<UI />", () => {
    let comp: ShallowWrapper;

    beforeEach(() => {
        comp = shallow(<UI state={new UIState()} />);
    })

    it("UI is a function", () => {
        expect(typeof UI).toBe("function");
    });

    it("Should render without throwing an error", () => {
        console["log"](comp);
        expect(comp).not.toBe(undefined)
    });
});
