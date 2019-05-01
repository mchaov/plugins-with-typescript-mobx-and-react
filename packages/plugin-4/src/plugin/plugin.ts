import { observable, action } from "mobx";
import { ComponentStatus, IPlugin, MessageBus, MessageBusChannels, IPluginAPI, IImage } from "../../../contracts";
import { createPresentation } from "../helpers";
import Vue from "vue";

export class Plugin implements IPlugin {

    name: string
    @observable api: IPluginAPI
    @observable status: ComponentStatus

    private mBus: MessageBus
    private div: HTMLDivElement
    private vue: Vue | undefined

    constructor(mBus: MessageBus) {
        this.mBus = mBus;
        this.vue = undefined;
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

    @action.bound activate(data: IImage[]) {
        this.status = ComponentStatus.active;
        this.api.ui = createPresentation(this.div);
        this.div.innerHTML = `
        <h2>Vue Carousel :D :D :D</h2>
        <div id="vueCarousel" class="vueCarousel">
            <vueper-slides fade slide-content-outside="top" slide-content-outside-class="max-widthed" :touchable="false" :slide-ratio="0.3">
            <vueper-slide
                v-for="(slide, i) in slides"
                :key="i"
                :image="slide.url"
                :title="'# ' + slide.name"
                :content="slide.label"></vueper-slide>
            </vueper-slides>
        </div>`;

        // no reason to cover this with tests for the demo
        /* istanbul ignore next */
        setTimeout(/* istanbul ignore next */() => {
            this.vue = new window["Vue"]({ el: "#vueCarousel", data: { slides: data.slice() } });
        })
    }

    @action.bound deactivate() {
        this.api.ui = undefined;
        this.vue && this.vue.$destroy();
        this.status = ComponentStatus.inactive;
    }
}