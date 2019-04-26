import { UIState } from "./state";
import { ComponentStatus, MessageBusChannels } from "../../../contracts";
import { EventEmitter } from "eventemitter3";

const ee = new EventEmitter();

describe("UIState", () => {
    it("UIState instantiates", () => {
        const inst = new UIState(ee);
        expect(inst).toBeInstanceOf(UIState);
        expect(inst.status).toBe(ComponentStatus.init);
        expect(inst.bl.status).toBe(ComponentStatus.void);
        expect(typeof inst.bl.activate).toBe("function");
        expect(typeof inst.bl.deactivate).toBe("function");
    });

    it("UIState activates", () => {
        const inst = new UIState(ee);
        inst.activate();
        expect(inst.status).toBe(ComponentStatus.active);
    });

    it("UIState deactivates", () => {
        const inst = new UIState(ee);
        inst.deactivate();
        expect(inst.status).toBe(ComponentStatus.inactive);
    });



    it("UIState listens for Bl register messages", done => {
        const inst = new UIState(ee);
        inst.activate();

        ee.emit(MessageBusChannels.register.bl, {
            mBus: ee,
            activate: () => { },
            deactivate: () => { },
            status: ComponentStatus.init
        });

        setTimeout(() => {
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
        inst.activate();
        expect(actMock).toHaveBeenCalledTimes(1);

        inst.deactivate();
        inst.deactivate();
        inst.deactivate();
        expect(deactMock).toHaveBeenCalledTimes(1);
    });
})