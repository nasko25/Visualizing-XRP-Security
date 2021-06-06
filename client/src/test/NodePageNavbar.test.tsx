import { createBrowserHistory, History } from 'history';
import { Peer, NodeInfoDB, PeerNodeDB } from '../components/node-page/NodePageTypes';
import { shallow, mount } from 'enzyme';
import React, { KeyboardEvent } from "react";
import { fireEvent, screen, getByText, getByTestId } from '@testing-library/react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import NodePageNavbar from '../components/node-page/NodePageNavbar';


let container: HTMLElement | null = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
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

const NodePageNavbarPropsMock = {
    history: createBrowserHistory(),
    onSearch: (e: React.KeyboardEvent<HTMLInputElement>) => { console.log('Search') },
    searchID: "search"
}

test('All 3 buttons and Search Bar are present in DOM', () => {

    // Render the NodePageNavbar
    act(() => {
        render(<NodePageNavbar
            onSearch={NodePageNavbarPropsMock.onSearch}
            history={NodePageNavbarPropsMock.history}
            searchID={NodePageNavbarPropsMock.searchID}></NodePageNavbar>, container);
    });

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

    // Render the NodePageNavbar
    act(() => {
        render(<NodePageNavbar
            onSearch={NodePageNavbarPropsMock.onSearch}
            history={NodePageNavbarPropsMock.history}
            searchID={NodePageNavbarPropsMock.searchID}></NodePageNavbar>, container);
    });

    var buttonValidators: HTMLButtonElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        buttonValidators = (getByTestId(container, "validators-button") as HTMLButtonElement);
    }


    // Assert that the button is present
    expect(buttonValidators).not.toBeNull();
    expect(buttonValidators).toBeTruthy();

    if (buttonValidators !== null){
        // Simulate button click
        act(() => {
            buttonValidators?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // Check that the history has updated
        expect(NodePageNavbarPropsMock.history.location.pathname).toEqual('/validators');
    }
    
});

test('Stock button triggers correct onClick event', () => {

    // Render the NodePageNavbar
    act(() => {
        render(<NodePageNavbar
            onSearch={NodePageNavbarPropsMock.onSearch}
            history={NodePageNavbarPropsMock.history}
            searchID={NodePageNavbarPropsMock.searchID}></NodePageNavbar>, container);
    });

    var buttonStock: HTMLButtonElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        buttonStock = (getByTestId(container, "stock-button") as HTMLButtonElement);
    }

    // Assert that the button is present
    expect(buttonStock).not.toBeNull();
    expect(buttonStock).toBeTruthy();

    if (buttonStock !== null){
        // Simulate button click
        act(() => {
            buttonStock?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // Check that the history has updated
        expect(NodePageNavbarPropsMock.history.location.pathname).toEqual('/');
    }
});

test('About button triggers correct onClick event', () => {

    // Render the NodePageNavbar
    act(() => {
        render(<NodePageNavbar
            onSearch={NodePageNavbarPropsMock.onSearch}
            history={NodePageNavbarPropsMock.history}
            searchID={NodePageNavbarPropsMock.searchID}></NodePageNavbar>, container);
    });

    var buttonAbout: HTMLButtonElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        buttonAbout = (getByTestId(container, "about-button") as HTMLButtonElement);
    }

    // Assert that the button is present
    expect(buttonAbout).not.toBeNull();
    expect(buttonAbout).toBeTruthy();

    if (buttonAbout !== null){
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

    // Render the NodePageNavbar
    act(() => {
        render(<NodePageNavbar
            onSearch={NodePageNavbarPropsMock.onSearch}
            history={NodePageNavbarPropsMock.history}
            searchID={NodePageNavbarPropsMock.searchID}></NodePageNavbar>, container);
    });

    const onSearchSpy = jest.spyOn(NodePageNavbarPropsMock, "onSearch");

    var search: HTMLInputElement | null= null;

    // Get the buttons from the DOM
    if (container !== null) {
        search = (getByTestId(container, "search") as HTMLInputElement);
    }

    let btuh = null;
    act(() => {
        btuh = search?.dispatchEvent(new KeyboardEvent('keypress', {'key': 'Enter'}));
    });

    console.log(btuh);

    // Assert that all the buttons are present
    expect(search).toBeTruthy();
    expect(onSearchSpy).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
});