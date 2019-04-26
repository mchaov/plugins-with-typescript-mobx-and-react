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
                Bl state: {this.state.bl.status}
            </div>
        )
    }
}