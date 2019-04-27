import * as ReactDOM from "react-dom"

export function unmount(element: Element) {
    if (element === null) {
        return false;
    }
    return ReactDOM.unmountComponentAtNode(element);
}