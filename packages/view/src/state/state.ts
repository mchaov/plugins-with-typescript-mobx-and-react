import { action, observable } from "mobx";
import { MessageBus, MessageBusChannels, IBl, ComponentStatus } from "../../../contracts";
export class UIState {
    mBus: MessageBus
    @observable bl: IBl
    @observable status: ComponentStatus

    constructor(mBus: MessageBus) {
        this.mBus = mBus;
        this.status = ComponentStatus.init;
        this.bl = {
            mBus,
            activate: () => { },
            deactivate: () => { },
            status: ComponentStatus.void
        };
    }

    @action.bound private setBl(x: IBl) {
        this.bl = x;
    }

    activate() {
        if (this.status !== ComponentStatus.active) {
            this.status = ComponentStatus.active;
            this.bl.activate();
            this.mBus.on(MessageBusChannels.register.bl, this.setBl)
            this.mBus.emit(MessageBusChannels.callToRegister);
        }
    }

    deactivate() {
        if (this.status !== ComponentStatus.inactive) {
            this.status = ComponentStatus.inactive;
            this.bl.deactivate();
            this.mBus.off(MessageBusChannels.register.bl, this.setBl)
        }
    }
}