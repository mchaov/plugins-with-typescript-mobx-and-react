import * as React from "react";
import * as ReactDOM from "react-dom";
import { UI, UIProps } from "./ui";
import { UIState } from "./state";

export type ViewOptions = {}

export class View {
    msgBus: any
    domId: string
    props: UIProps
    state: UIState

    constructor(domId: string, options: ViewOptions) {
        options;
        this.domId = domId;
        this.msgBus = {};
        this.state = new UIState();
        this.props = { state: this.state };
    }

    activate() {
        const domRef = document.getElementById(this.domId);
        if (domRef !== null) {
            ReactDOM.render(<UI {...this.props} />, domRef);
        }
        return this;
    }

    deactivate() {
        const domRef = document.getElementById(this.domId);
        if (domRef !== null) { ReactDOM.unmountComponentAtNode(domRef) }
        return this;
    }
}