import { EventEmitter } from "eventemitter3";
import { Plugin } from "./plugin";
import { ComponentStatus, MessageBusChannels } from "../../../contracts";

const ee = new EventEmitter();
const mockFn = jest.fn();

window["Vue"] = class Vue {
    $destroy() { mockFn(); }
}

describe("Plugin", () => {
    it("Plugin initializes", () => {
        const inst = new Plugin(ee);
        expect(inst).toBeInstanceOf(Plugin);
        expect(inst.status).toBe(ComponentStatus.init);
    });

    it("Plugin activates", () => {
        const inst = new Plugin(ee);
        inst.activate([]);
        expect(inst.status).toBe(ComponentStatus.active);
    });

    it("Plugin deactivates", () => {
        const inst = new Plugin(ee);
        inst.deactivate();
        expect(inst.status).toBe(ComponentStatus.inactive);
    });

    it("Plugin deactivates vue", done => {
        // vue instance is created in setTimeout
        // to get out of the current React rendering stack
        const inst = new Plugin(ee);
        inst.activate([]);
        setTimeout(() => {
            inst.deactivate();
            expect(mockFn).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it("Plugin sends instance upon callToRegister message", done => {
        ee.on(MessageBusChannels.register.plugin, x => {
            expect(x).toBeInstanceOf(Plugin)
            done();
        });

        new Plugin(ee);
        ee.emit(MessageBusChannels.callToRegisterPlugins);
    });
});