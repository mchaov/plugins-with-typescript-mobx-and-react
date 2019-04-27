import { observable, action } from "mobx";
import { ComponentStatus, IPlugin, MessageBus, MessageBusChannels, IPluginAPI } from "../../../contracts";
import { createPresentation } from "../helpers";

export class Plugin implements IPlugin {

    name: string
    @observable api: IPluginAPI
    @observable status: ComponentStatus

    private mBus: MessageBus
    private div: HTMLDivElement
    private divId: string

    constructor(mBus: MessageBus) {
        this.mBus = mBus;
        this.name = "Plugin 1";
        this.api = { ui: undefined };
        this.status = ComponentStatus.init;

        this.divId = `plugin1-${Date.now()}`;
        this.div = document.createElement("div");
        this.div.id = this.divId;

        this.clickHandler = this.clickHandler.bind(this);

        this.mBus.on(MessageBusChannels.callToRegisterPlugins, this.callToRegister, this);
        this.callToRegister();
    }

    private callToRegister() {
        this.mBus.emit(MessageBusChannels.register.plugin, this);
    }

    // we will not test calls to browser APIs in this demo
    /* istanbul ignore next */
    private clickHandler(e: Event) {
        if (e.target && (e.target as HTMLElement).nodeName === "BUTTON") {
            this.div.innerHTML += `<hr/> added more HTML for some reason! <button type="button">MOAR button</button>`;
        }
    }

    @action.bound activate() {
        this.div.innerHTML = `
            ${this.name} view is active now!
            <button type="button">test button</button>
        `;
        this.api.ui = createPresentation(this.div);
        this.status = ComponentStatus.active;

        // React renders outside of the current call stack
        // we need to setup our event listeners afterwards
        /* istanbul ignore next */
        setTimeout(/* istanbul ignore next */() => {
            let node = document.getElementById(this.divId);
            if (node) {
                node.addEventListener("click", this.clickHandler, true);
            }
        });
    }

    @action.bound deactivate() {
        let node = document.getElementById(this.divId);
        // React renders outside of the current call stack
        // we need to setup our event listeners afterwards
        /* istanbul ignore next */
        if (node) {
            /* istanbul ignore next */
            node.removeEventListener("click", this.clickHandler, true);
        }
        this.api.ui = undefined;
        this.status = ComponentStatus.inactive;
    }
}