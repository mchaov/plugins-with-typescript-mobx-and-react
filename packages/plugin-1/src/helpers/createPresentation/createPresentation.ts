import * as React from "react"
import { Presentation, PresentationProps } from "../../Presentation"

export function createPresentation(div: HTMLDivElement) {
    return React.createElement<PresentationProps>(
        Presentation, { placeholder: div }
    );
}