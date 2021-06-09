import { createBrowserHistory, History } from 'history';
import React from "react";
import { fireEvent, screen, getByText, getByTestId} from '@testing-library/react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import NodePageNavbar from '../components/node-page/NodePageNavbar';

const NodePageNavbarPropsMock = {
    history: createBrowserHistory(),
    onSearch: (e: React.KeyboardEvent<HTMLInputElement>) => { 
        if(e.key === "Enter")
            console.log('Search');
    },
    searchID: "search"
}

let container: HTMLElement | null = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Render the NodePageNavbar
    act(() => {
        render(<NodePageNavbar
            onSearch={NodePageNavbarPropsMock.onSearch}
            history={NodePageNavbarPropsMock.history}
            searchID={NodePageNavbarPropsMock.searchID}>
            </NodePageNavbar>, container);
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

test('All 3 buttons and Search Bar are present in DOM', () => {

    var buttonValidators = null;
    var buttonStock = null;
    var buttonAbout = null;
    var search = null;

    // Get the buttons from the DOM
    if (container !== null) {
        buttonValidators = getByTestId(container, "validators-button");
        buttonStock = getByTestId(container, "stock-button");
        buttonAbout = getByTestId(container, "about-button");
        search = getByTestId(container, "search");
    }

    // Assert that all the buttons are present
    expect(buttonValidators).toBeTruthy();
    expect(buttonStock).toBeTruthy();
    expect(buttonAbout).toBeTruthy();
    expect(search).toBeTruthy();
});

test('Validators button triggers correct onClick event', () => {

    var buttonValidators: HTMLButtonElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        buttonValidators = (getByTestId(container, "validators-button") as HTMLButtonElement);
    }


    // Assert that the button is present
    expect(buttonValidators).not.toBeNull();
    expect(buttonValidators).toBeTruthy();

    if (buttonValidators !== null) {
        // Simulate button click
        act(() => {
            buttonValidators?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // Check that the history has updated
        expect(NodePageNavbarPropsMock.history.location.pathname).toEqual('/validators');
    }

});

test('Stock button triggers correct onClick event', () => {

    var buttonStock: HTMLButtonElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        buttonStock = (getByTestId(container, "stock-button") as HTMLButtonElement);
    }

    // Assert that the button is present
    expect(buttonStock).not.toBeNull();
    expect(buttonStock).toBeTruthy();

    if (buttonStock !== null) {
        // Simulate button click
        act(() => {
            buttonStock?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // Check that the history has updated
        expect(NodePageNavbarPropsMock.history.location.pathname).toEqual('/');
    }
});

test('About button triggers correct onClick event', () => {

    var buttonAbout: HTMLButtonElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        buttonAbout = (getByTestId(container, "about-button") as HTMLButtonElement);
    }

    // Assert that the button is present
    expect(buttonAbout).not.toBeNull();
    expect(buttonAbout).toBeTruthy();

    if (buttonAbout !== null) {
        // Simulate button click
        act(() => {
            buttonAbout?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // Check that the history has updated
        expect(NodePageNavbarPropsMock.history.location.pathname).toEqual('/about');
    }
});

/**
 * This test only checks whether the search event is triggred
 * when the Enter key is pressed.
 * It DOES NOT check whether the search event behaves correctly.
 * The tests for this are in the NodePageMain tests, as that
 * is where the actual function resides.
 */
test('Search event is triggered correctly', () => {

    console.log = jest.fn();

    const onSearchSpy = jest.spyOn(NodePageNavbarPropsMock, "onSearch");
    var search: HTMLInputElement | null = null;

    // Get the buttons from the DOM
    if (container !== null) {
        search = (getByTestId(container, "search") as HTMLInputElement);
    }

    act(() => {
        if (search !== null) {
            fireEvent.keyPress(search, { key: 'Enter', keyCode: 13, which: 13 });
            fireEvent.keyPress(search, { key: 'a', keyCode: 13, which: 13 });
            fireEvent.keyPress(search, { key: 'Enter', keyCode: 13, which: 13 });
        }
    });

    expect(search).toBeTruthy();
    // The mock search function just console.logs "Search" when Enter is pressed
    expect(console.log).toHaveBeenCalledTimes(2);
});