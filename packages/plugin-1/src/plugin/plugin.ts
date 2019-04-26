import { observable, action } from "mobx";
import { ComponentStatus, IPlugin, MessageBus, MessageBusChannels } from "../../../contracts";

export class Plugin implements IPlugin {
    name: string

    private mBus: MessageBus
    @observable status: ComponentStatus

    constructor(mBus: MessageBus) {
        this.mBus = mBus;
        this.name = "Plugin 1";
        this.status = ComponentStatus.init;
        this.mBus.on(MessageBusChannels.callToRegister, this.callToRegister, this);
        this.callToRegister();
    }

    private callToRegister() {
        this.mBus.emit(MessageBusChannels.register.plugin, this);
    }

    @action.bound activate() {
        this.status = ComponentStatus.active;
    }

    @action.bound deactivate() {
        this.status = ComponentStatus.inactive;
    }
}