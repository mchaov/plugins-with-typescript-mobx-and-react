import { observable, action } from "mobx";
import { ComponentStatus, IPlugin, MessageBus, MessageBusChannels, IPluginAPI } from "../../../contracts";
import { createPresentation } from "../helpers";

export class Plugin implements IPlugin {

    name: string
    @observable api: IPluginAPI
    @observable status: ComponentStatus

    private mBus: MessageBus
    private div: HTMLDivElement

    constructor(mBus: MessageBus) {
        this.mBus = mBus;
        this.name = "Plugin 2";
        this.api = { ui: undefined };
        this.status = ComponentStatus.init;

        this.div = document.createElement("div");
        this.div.innerHTML = `${this.name} view is active now!`;

        this.mBus.on(MessageBusChannels.callToRegisterPlugins, this.callToRegister, this);
        this.callToRegister();
    }

    private callToRegister() {
        this.mBus.emit(MessageBusChannels.register.plugin, this);
    }

    @action.bound activate() {
        this.api.ui = createPresentation(this.div);
        this.status = ComponentStatus.active;
    }

    @action.bound deactivate() {
        this.api.ui = undefined;
        this.status = ComponentStatus.inactive;
    }
}