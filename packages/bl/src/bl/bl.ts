import { observable, action, computed } from "mobx";
import { MessageBus, MessageBusChannels, ComponentStatus, IBl, IPlugin } from "../../../contracts";

export class Bl implements IBl {
    private mBus: MessageBus
    @observable status: ComponentStatus
    @observable private plugins: IPlugin[]

    constructor(mBus: MessageBus) {
        this.mBus = mBus;
        this.plugins = [];
        this.status = ComponentStatus.init;
        this.mBus.on(MessageBusChannels.callToRegisterBl, this.callToRegister, this);
        this.mBus.on(MessageBusChannels.register.plugin, this.registerPlugin);
        this.callToRegister();
    }

    @action.bound private registerPlugin(plugin: IPlugin) {
        if (this.plugins.filter(x => x.name === plugin.name).length === 0) {
            this.plugins.push(plugin);
        }
    }

    private callToRegister() {
        this.mBus.emit(MessageBusChannels.register.bl, this);
        this.mBus.emit(MessageBusChannels.callToRegisterPlugins);
    }

    @action.bound activate() {
        this.status = ComponentStatus.active;
    }

    @action.bound deactivate() {
        this.status = ComponentStatus.inactive;
    }

    @action.bound deactivatePlugins() {
        this.plugins.forEach(x => x.deactivate());
    }

    @action.bound activatePlugin(pluginName: string) {
        this.deactivatePlugins();
        let p = this.plugins.find(x => x.name === pluginName);
        if (p) {
            p.activate();
        }
    }

    @computed get availablePlugins() {
        return this.plugins.map(x => x.name);
    }

    @computed get activePlugin() {
        return this.plugins.filter(x => x.status === ComponentStatus.active)[0];
    }
}