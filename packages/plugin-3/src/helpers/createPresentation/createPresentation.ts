import * as React from "react"
import { Presentation, PresentationProps } from "../../Presentation"
import { IImage } from "../../../../contracts";

export function createPresentation(data: IImage[]) {
    return React.createElement<PresentationProps>(Presentation, { data });
}