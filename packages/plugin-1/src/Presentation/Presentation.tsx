import * as React from "react";
import { createRef, RefObject } from "react";
import { observer } from "mobx-react";

export interface PresentationState { }
export interface PresentationProps { placeholder: any }

@observer
export class Presentation extends React.Component<PresentationProps, PresentationState>{
    viewport: RefObject<HTMLDivElement>

    constructor(props) {
        super(props);
        this.viewport = createRef<HTMLDivElement>();
        this.componentDidMount = this.injectHTML;
    }

    injectHTML() {
        // coverage tool can't properly estimate that these branches are covered
        // both branches for "this.props.placeholder" are covered by different snapshots
        // "this.viewport.current" existance cannot be tested without failing the render
        // of the component, thus reduces coverage, but in this case the React
        // is going to throw error and render ErrorBoundary component
        /* istanbul ignore next */
        if (
            this.viewport.current &&
            this.props.placeholder !== null
        ) {
            this.viewport.current.appendChild(this.props.placeholder);
        }
    }

    render() { return <div ref={this.viewport}>{this.props.children}</div> }
}