import * as Enzyme from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

Enzyme.configure({ adapter: new Adapter() });

// Fail tests on any warning
console.error = message => {
    throw new Error(message);
};