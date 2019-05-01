import { observable, action, computed } from "mobx";
import { MessageBus, MessageBusChannels, ComponentStatus, IBl, IPlugin, IImage } from "../../../contracts";

export class Bl implements IBl {
    private mBus: MessageBus
    @observable data: IImage[]
    @observable status: ComponentStatus
    @observable private plugins: IPlugin[]

    constructor(mBus: MessageBus) {
        this.data = [];
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

    @action.bound imagineAFetchRequest() {
        new Array(13).fill(0).forEach((x, i) => {
            this.data.push({
                name: `Image ${i} name`,
                label: `Image ${i} label`,
                id: `i-${performance.now()}`,
                url: "https://picsum.photos/1280/960"
            })
        })
    }

    @action.bound activate() {
        if (this.status !== ComponentStatus.active) {
            this.imagineAFetchRequest();
            this.status = ComponentStatus.active;
        }
    }

    @action.bound deactivate() {
        if (this.status !== ComponentStatus.inactive) {
            this.deactivatePlugins();
            this.status = ComponentStatus.inactive;
        }
    }

    @action.bound deactivatePlugins() { this.plugins.forEach(x => x.deactivate()); }

    @action.bound activatePlugin(pluginName: string) {
        this.deactivatePlugins();
        let p = this.plugins.find(x => x.name === pluginName);
        if (p) {
            p.activate(this.data);
        }
    }

    @computed get availablePlugins() { return this.plugins.map(x => x.name); }

    @computed get activePlugin() {
        return this.plugins.filter(x => x.status === ComponentStatus.active)[0];
    }
}