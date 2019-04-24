import { UIState } from "./state";

describe("UIState", () => {
    it("UIState instantiates", () => {
        const inst = new UIState();
        expect(inst).toBeInstanceOf(UIState);
    })
})