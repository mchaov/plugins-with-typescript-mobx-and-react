import { EventEmitter } from "eventemitter3";
import { observable, action } from "mobx";
import { Bl } from "./bl";
import { ComponentStatus, MessageBusChannels, IPlugin, IBl } from "../../../contracts";

const ee = new EventEmitter();
var inst: IBl;

beforeEach(() => { inst = new Bl(ee); });
afterEach(() => { inst = undefined as any; });

describe("Bl", () => {
    it("Bl initializes", () => {
        expect(inst).toBeInstanceOf(Bl);
        expect(inst.status).toBe(ComponentStatus.init);
    });

    it("Bl activates", () => {
        inst.activate();
        inst.activate();
        expect(inst.status).toBe(ComponentStatus.active);
    });

    it("Bl deactivates", () => {
        inst.deactivate();
        inst.deactivate();
        expect(inst.status).toBe(ComponentStatus.inactive);
    });

    it("Bl sends instance upon callToRegister message", done => {
        ee.on(MessageBusChannels.register.bl, x => {
            expect(x).toBeInstanceOf(Bl)
            done();
        });

        new Bl(ee);
        ee.emit(MessageBusChannels.callToRegisterBl);
    });

    it("Bl plugin registers", done => {
        const plugin: IPlugin = {
            activate: () => { },
            name: "test plugin",
            deactivate: () => { },
            api: { ui: undefined },
            status: ComponentStatus.void
        }
        expect(inst["plugins"].length).toBe(0);

        ee.emit(MessageBusChannels.register.plugin, plugin);
        ee.emit(MessageBusChannels.register.plugin, plugin);

        setTimeout(() => {
            expect(inst["plugins"].length).toBe(1);
            expect(inst["plugins"][0].name).toBe("test plugin");
            done();
        });
    });

    it("Bl plugin activePlugin: Branch 1 - no active plugin", () => {
        expect(inst.activePlugin).toBe(undefined);
    });

    it("Bl plugin activePlugin: Branch 2 - active plugin", () => {
        const plugin: IPlugin = {
            activate: () => { },
            name: "test plugin",
            deactivate: () => { },
            api: { ui: undefined },
            status: ComponentStatus.init
        }
        const plugin2: IPlugin = {
            activate: () => { },
            deactivate: () => { },
            name: "test plugin 2",
            api: { ui: undefined },
            status: ComponentStatus.active
        }
        expect(inst["plugins"].length).toBe(0);

        ee.emit(MessageBusChannels.register.plugin, plugin);
        ee.emit(MessageBusChannels.register.plugin, plugin2);

        expect(inst["plugins"].length).toBe(2);
        expect(inst.activePlugin).toEqual(plugin2);
    });

    it("Bl plugin activePlugin: Branch 3 - activate/deactivate plugin", () => {
        const plugin: IPlugin = observable({
            activate: action(() => { plugin.status = ComponentStatus.active }),
            deactivate: action(() => { plugin.status = ComponentStatus.inactive }),
            api: { ui: undefined },
            name: "test plugin",
            status: ComponentStatus.init
        })
        const plugin2: IPlugin = observable({
            activate: action(() => { plugin2.status = ComponentStatus.active }),
            deactivate: action(() => { plugin2.status = ComponentStatus.inactive }),
            api: { ui: undefined },
            name: "test plugin 2",
            status: ComponentStatus.init
        });

        ee.emit(MessageBusChannels.register.plugin, plugin);
        ee.emit(MessageBusChannels.register.plugin, plugin2);

        inst.activatePlugin(plugin.name);
        expect(inst.activePlugin && inst.activePlugin.name).toEqual(plugin.name);

        inst.activatePlugin(plugin2.name);
        expect(inst.activePlugin && inst.activePlugin.name).toEqual(plugin2.name);

        inst.activatePlugin(plugin.name);
        expect(inst.activePlugin && inst.activePlugin.name).toEqual(plugin.name);
        
        inst.deactivate();
        expect(inst.activePlugin).toEqual(undefined);
    });

    it("Bl plugin activePlugin: Branch 4 - activate non existing plugin", () => {
        inst.activatePlugin("something");
        expect(inst.activePlugin).toEqual(undefined);
    });

    it("Bl availablePlugins", () => {
        expect(inst.availablePlugins.length).toBe(0);
        const plugin: IPlugin = observable({
            activate: action(() => { plugin.status = ComponentStatus.active }),
            deactivate: action(() => { plugin.status = ComponentStatus.inactive }),
            api: { ui: undefined },
            name: "test plugin",
            status: ComponentStatus.init
        })
        const plugin2: IPlugin = observable({
            activate: action(() => { plugin2.status = ComponentStatus.active }),
            deactivate: action(() => { plugin2.status = ComponentStatus.inactive }),
            api: { ui: undefined },
            name: "test plugin 2",
            status: ComponentStatus.init
        });

        ee.emit(MessageBusChannels.register.plugin, plugin);
        ee.emit(MessageBusChannels.register.plugin, plugin2);

        expect(inst.availablePlugins.length).toBe(2);
    });
});