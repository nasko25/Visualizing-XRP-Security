import AboutPageMain from "../components/about-page/AboutPageMain";
import { getByTestId } from '@testing-library/react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

let container: HTMLElement | null = null;

beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Render the AboutMainPage
    act(() => {
        render(<AboutPageMain>
        </AboutPageMain>, container);
    });
});

afterEach(() => {
    // cleanup on exiting
    if (container !== null) {
        unmountComponentAtNode(container);
        container.remove();
    }
    container = null;
    jest.clearAllMocks();
});

test('All paragraphs are present', () => {

    var p1 = null;
    var p2 = null;
    var p3 = null;
    var p4 = null;
    var p5 = null;
    var p6 = null;

    // Get the paragprahs from the DOM
    if (container !== null) {
        p1 = getByTestId(container, "p1");
        p2 = getByTestId(container, "p2");
        p3 = getByTestId(container, "p3");
        p4 = getByTestId(container, "p4");
        p5 = getByTestId(container, "p5");
        p6 = getByTestId(container, "p6");
    }

    // Assert that all the buttons are present
    expect(p1).toBeTruthy();
    expect(p2).toBeTruthy();
    expect(p3).toBeTruthy();
    expect(p4).toBeTruthy();
    expect(p5).toBeTruthy();
    expect(p6).toBeTruthy();
});