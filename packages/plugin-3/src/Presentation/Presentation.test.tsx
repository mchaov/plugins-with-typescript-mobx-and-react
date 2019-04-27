import * as React from "react";
import { shallow } from "enzyme";
import { Presentation } from "./Presentation";

describe("<Presentation />", () => {

    it("Presentation renders correctly", () => {
        const comp = shallow(<Presentation />);
        expect(typeof Presentation).toBe("function");
        expect(comp).toMatchSnapshot();
    });

    it("Presentation handles no input params", () => {
        const comp = shallow(<Presentation />);
        expect(comp).toMatchSnapshot();
    });
});