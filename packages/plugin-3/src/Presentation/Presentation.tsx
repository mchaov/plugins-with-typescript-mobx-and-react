import * as React from "react";
import { BuildCarousel } from "../helpers";
import { IImage } from "../../../contracts";

export interface PresentationState { }
export interface PresentationProps { data: IImage[] }

export class Presentation extends React.PureComponent<PresentationProps, PresentationState>{
    render() {
        return <BuildCarousel {...this.props} />
    }
}