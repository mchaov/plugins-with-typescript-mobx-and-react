import * as React from "react";
import { shallow, render, ShallowWrapper } from "enzyme";
import { EventEmitter } from "eventemitter3";
import { UIState } from "../state";
import { UI } from "./ui";
import { IPlugin, ComponentStatus } from "../../../contracts";

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
        expect(comp).not.toBe(undefined);
        expect(comp.children.length).toBe(1);
        expect(comp.find("button").length).toBe(0);
    });

    it("Renders active plugin", () => {
        const state: UIState = {
            mBus: ee,
            setBl: (x) => { },
            activate: () => { },
            deactivate: () => { },
            status: ComponentStatus.active,
            bl: {
                data: [],
                status: ComponentStatus.active,
                activatePlugin: (x) => { },
                activate: () => { },
                deactivate: () => { },
                availablePlugins: ["test"],
                activePlugin: {
                    name: "test",
                    activate: () => { },
                    deactivate: () => { },
                    api: { ui: <span>test</span> },
                    status: ComponentStatus.active,
                } as IPlugin
            }
        } as any;

        const comp = render(<UI state={state} />);

        expect(comp.find("button").length).toBe(1);
    });
});
