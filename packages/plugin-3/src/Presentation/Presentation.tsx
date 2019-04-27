import * as React from "react";
import { observer } from "mobx-react";
import { BuildCarousel } from "../helpers";

export interface PresentationState { }
export interface PresentationProps { }

@observer
export class Presentation extends React.PureComponent<PresentationProps, PresentationState>{
    render() {
        return <div><BuildCarousel /></div>
    }
}