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
        this.name = "Plugin 2 - jQuery carousel plugin";
        this.api = { ui: undefined };
        this.status = ComponentStatus.init;

        this.div = document.createElement("div");
        this.div.className = "cc_ccCarousel";
        this.div.innerHTML = `${this.name} view is active now!`;

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
        <h2>jQuery Carousel FTW!</h2>
        <div class="cc_galleryWrapper">
            <div class="cc_dynamic">
                <div class="cc_leftDirection"></div>
                <div class="cc_rightDirection"></div>
                <div class="cc_slider">
                    ${new Array(13)
                .fill(0)
                .map(() => `<div class="cc_image"><img src="/third-party/imgs/placeholder.png"></div>`).join("")}
                </div>
            </div>
        </div>`;

        // no reason to cover this with tests for the demo
        // it is not realistic implementation, no one is using
        // jQuery after 2016 :) :) :)
        /* istanbul ignore next */
        setTimeout(/* istanbul ignore next */() => {
            window["$"](".cc_galleryWrapper").ccCarousel({});
        })
    }

    @action.bound deactivate() {
        this.api.ui = undefined;
        this.status = ComponentStatus.inactive;
    }
}