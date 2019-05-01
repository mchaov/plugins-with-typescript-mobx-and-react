import * as React from "react";
import { observer } from "mobx-react";
import { UIState } from "../state";

export type UIProps = { state: UIState }

@observer
export class UI extends React.Component<UIProps, UIState> {
    constructor(props: UIProps) {
        super(props);
        this.state = props.state;
    }

    render() {
        return (
            <div className="view">
                Bl state: {this.state.bl.status}<br />
                Bl data available: <b>{this.state.bl.data.length}</b> images.
                <hr />
                {this.state.bl.availablePlugins.map((x, i) =>
                    <button
                        key={i}
                        onClick={this.state.bl.activatePlugin.bind(null, x)}
                    >{x}</button>
                )}
                <hr />
                {this.state.bl.activePlugin && this.state.bl.activePlugin.api.ui}
            </div>
        )
    }
}