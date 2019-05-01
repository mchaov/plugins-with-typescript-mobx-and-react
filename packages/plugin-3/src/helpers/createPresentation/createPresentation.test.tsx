import * as React from "react"

import { shallow } from "enzyme";

import { Presentation } from "../../Presentation";
import { createPresentation } from "./createPresentation";

describe("createPresentation", () => {
    it("createPresentation create presentation with props", () => {
        expect(typeof createPresentation).toBe("function");
        expect(shallow(createPresentation([])))
            .toEqual(shallow(<Presentation data={[]} />))
    })
})