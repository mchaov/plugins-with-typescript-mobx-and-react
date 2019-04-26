import * as React from "react";
import * as ReactDOM from "react-dom";
import { UI, UIProps } from "./ui";
import { UIState } from "./state";
import { MessageBus } from "../../contracts";

export type ViewOptions = { mBus: MessageBus }

export class View {
    domId: string
    props: UIProps
    state: UIState

    constructor(domId: string, options: ViewOptions) {
        this.domId = domId;
        this.state = new UIState(options.mBus);
        this.props = { state: this.state };
    }

    activate() {
        const domRef = document.getElementById(this.domId);
        if (domRef !== null) { ReactDOM.render(<UI {...this.props} />, domRef); }
        this.state.activate();
        return this;
    }

    deactivate() {
        const domRef = document.getElementById(this.domId);
        if (domRef !== null) { ReactDOM.unmountComponentAtNode(domRef) }
        this.state.deactivate();
        return this;
    }
}