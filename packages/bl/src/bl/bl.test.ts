import { EventEmitter } from "eventemitter3";
import { Bl } from "./bl";
import { ComponentStatus, MessageBusChannels } from "../../../contracts";

const ee = new EventEmitter();

describe("Bl", () => {
    it("Bl initializes", () => {
        const inst = new Bl(ee);
        expect(inst).toBeInstanceOf(Bl);
        expect(inst.status).toBe(ComponentStatus.init);
    });

    it("Bl activates", () => {
        const inst = new Bl(ee);
        inst.activate();
        expect(inst.status).toBe(ComponentStatus.active);
    });

    it("Bl deactivates", () => {
        const inst = new Bl(ee);
        inst.deactivate();
        expect(inst.status).toBe(ComponentStatus.inactive);
    });

    it("Bl sends instance upon callToRegister message", done => {
        ee.on(MessageBusChannels.register.bl, x => {
            expect(x).toBeInstanceOf(Bl)
            done();
        });

        new Bl(ee);
        ee.emit(MessageBusChannels.callToRegister);
    });
});