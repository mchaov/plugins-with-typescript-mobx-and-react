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
        this.name = "Plugin 4";
        this.api = { ui: undefined };
        this.status = ComponentStatus.init;

        this.div = document.createElement("div");
        this.div.className = "cc_ccCarousel";

        this.mBus.on(MessageBusChannels.callToRegisterPlugins, this.callToRegister, this);
        this.callToRegister();
    }

    private callToRegister() {
        this.mBus.emit(MessageBusChannels.register.plugin, this);
    }

    @action.bound activate() {
        this.status = ComponentStatus.active;
        this.api.ui = createPresentation(this.div);
        this.div.innerHTML = `
        <h2>Vue Carousel :D :D :D</h2>
        <div id="vueCarousel" class="vueCarousel">
            <vueper-slides :slide-ratio="1/4">
                <vueper-slide v-for="i in 5" :key="i" :title="i.toString()"></vueper-slide>
            </vueper-slides>
        </div>`;

        // no reason to cover this with tests for the demo
        // it is not realistic implementation, no one is using
        /* istanbul ignore next */
        setTimeout(/* istanbul ignore next */() => {
            new window["Vue"]({ el: "#vueCarousel" });
        })
    }

    @action.bound deactivate() {
        this.api.ui = undefined;
        this.status = ComponentStatus.inactive;
    }
}