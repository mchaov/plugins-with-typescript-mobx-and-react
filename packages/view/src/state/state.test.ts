import { UIState } from "./state";
import { ComponentStatus, MessageBusChannels } from "../../../contracts";
import { EventEmitter } from "eventemitter3";

const ee = new EventEmitter();
var inst: UIState = undefined as any;

beforeAll(() => { inst = new UIState(ee); });
afterAll(() => { inst = undefined as any; });

describe("UIState", () => {
    it("UIState instantiates", () => {
        expect(inst).toBeInstanceOf(UIState);
        expect(inst.status).toBe(ComponentStatus.init);

        expect(inst.bl.activePlugin).toBe(undefined);
        expect(inst.bl.availablePlugins.length).toBe(0);
        expect(inst.bl.status).toBe(ComponentStatus.void);

        expect(typeof inst.bl.activate).toBe("function");
        expect(typeof inst.bl.deactivate).toBe("function");
        expect(typeof inst.bl.activatePlugin).toBe("function");

        expect(inst.bl.activate()).toBe(undefined);
        expect(inst.bl.deactivate()).toBe(undefined);
        expect(inst.bl.activatePlugin("")).toBe(undefined);
    });

    it("UIState activates", () => {
        inst.activate();
        expect(inst.status).toBe(ComponentStatus.active);
    });

    it("UIState deactivates", () => {
        inst.deactivate();
        expect(inst.status).toBe(ComponentStatus.inactive);
    });

    it("UIState listens for Bl register messages", done => {
        inst.activate();
        const actMock = jest.fn();

        ee.emit(MessageBusChannels.register.bl, {
            mBus: ee,
            activate: actMock,
            deactivate: () => { },
            status: ComponentStatus.init
        });

        setTimeout(() => {
            expect(actMock).toHaveBeenCalledTimes(1);
            expect(inst.bl.status).toBe(ComponentStatus.init);
            done();
        }, 0);
    });

    it("UIState activates/deactivates Bl", () => {
        const actMock = jest.fn();
        const deactMock = jest.fn();
        const inst = new UIState(ee);
        inst.bl.activate = actMock;
        inst.bl.deactivate = deactMock;

        inst.activate();
        inst.activate();
        expect(actMock).toHaveBeenCalledTimes(1);

        inst.deactivate();
        inst.deactivate();
        expect(deactMock).toHaveBeenCalledTimes(1);
    });
})