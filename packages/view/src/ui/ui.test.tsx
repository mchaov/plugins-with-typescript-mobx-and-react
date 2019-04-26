import * as React from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { EventEmitter } from "eventemitter3";
import { UIState } from "../state";
import { UI } from "./ui";

const ee = new EventEmitter();

describe("<UI />", () => {
    let comp: ShallowWrapper;

    beforeEach(() => {
        comp = shallow(<UI state={new UIState(ee)} />);
    })

    it("UI is a function", () => {
        expect(typeof UI).toBe("function");
    });

    it("Should render without throwing an error", () => {
        expect(comp).not.toBe(undefined)
    });
});
