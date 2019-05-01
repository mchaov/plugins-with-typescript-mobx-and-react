import { observable, action } from "mobx";
import { ComponentStatus, IPlugin, MessageBus, MessageBusChannels, IPluginAPI, IImage } from "../../../contracts";
import { createPresentation } from "../helpers";

export class Plugin implements IPlugin {

    name: string
    @observable api: IPluginAPI
    @observable status: ComponentStatus

    private mBus: MessageBus

    constructor(mBus: MessageBus) {
        this.mBus = mBus;
        this.name = "Plugin 3";
        this.api = { ui: undefined };
        this.status = ComponentStatus.init;

        this.mBus.on(MessageBusChannels.callToRegisterPlugins, this.callToRegister, this);
        this.callToRegister();
    }

    private callToRegister() {
        this.mBus.emit(MessageBusChannels.register.plugin, this);
    }

    @action.bound activate(data: IImage[]) {
        this.api.ui = createPresentation(data);
        this.status = ComponentStatus.active;
    }

    @action.bound deactivate() {
        this.api.ui = undefined;
        this.status = ComponentStatus.inactive;
    }
}