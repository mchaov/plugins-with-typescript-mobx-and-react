import { observable, action } from "mobx";
import { MessageBus, MessageBusChannels, ComponentStatus, IBl } from "../../../contracts";

export class Bl implements IBl {
    mBus: MessageBus
    @observable status: ComponentStatus

    constructor(mBus: MessageBus) {
        this.mBus = mBus;
        this.status = ComponentStatus.init;
        this.mBus.on(MessageBusChannels.callToRegister, this.callToRegister, this);
        this.callToRegister();
    }

    private callToRegister() {
        this.mBus.emit(MessageBusChannels.register.bl, this);
    }

    @action.bound activate() {
        this.status = ComponentStatus.active;
    }

    @action.bound deactivate() {
        this.status = ComponentStatus.inactive;
    }
}