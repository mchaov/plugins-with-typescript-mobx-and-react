import * as ReactDOM from "react-dom"

/* istanbul ignore next */
export function render(
    element: JSX.Element,
    container: Element | null,
    callback?: (() => void) | undefined
) {
    return ReactDOM.render(element, container, callback)
}