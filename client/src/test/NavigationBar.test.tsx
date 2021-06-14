import { createBrowserHistory } from 'history';
import React from "react";
import { fireEvent, getByTestId } from '@testing-library/react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import NavigationBar from '../components/NavigationBar';

let container: HTMLElement | null = null;

var searchSpy: any;

beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    searchSpy = jest.spyOn(NavigationBar.prototype, "onKeyPressSearch");

    // Render the NodePageNavbar
    act(() => {
        render(<NavigationBar
            title="title">
        </NavigationBar>, container);
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
        buttonValidators = getByTestId(container, "validators-ref");
        buttonStock = getByTestId(container, "stock-ref");
        buttonAbout = getByTestId(container, "about-ref");
        search = getByTestId(container, "search");
    }

    // Assert that all the buttons are present
    expect(buttonValidators).toBeTruthy();
    expect(buttonStock).toBeTruthy();
    expect(buttonAbout).toBeTruthy();
    expect(search).toBeTruthy();
});

test('Validators button triggers correct onClick event', () => {

    var anchorValidators: HTMLAnchorElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        anchorValidators = (getByTestId(container, "validators-ref") as HTMLAnchorElement);
    }

    // Assert that the button is present
    expect(anchorValidators).not.toBeNull();
    expect(anchorValidators).toBeTruthy();

    expect(anchorValidators).toHaveAttribute('href', '/validators');

});

test('Stock button triggers correct onClick event', () => {

    var anchorStock: HTMLAnchorElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        anchorStock = (getByTestId(container, "stock-ref") as HTMLAnchorElement);
    }

    // Assert that the button is present
    expect(anchorStock).not.toBeNull();
    expect(anchorStock).toBeTruthy();

    expect(anchorStock).toHaveAttribute('href', '/');
});

test('About button triggers correct onClick event', () => {

    var anchorAbout: HTMLAnchorElement | null = null;

    // Get the button from the DOM
    if (container !== null) {
        anchorAbout = (getByTestId(container, "about-ref") as HTMLAnchorElement);
    }

    // Assert that the button is present
    expect(anchorAbout).not.toBeNull();
    expect(anchorAbout).toBeTruthy();

    expect(anchorAbout).toHaveAttribute('href', '/about');
});

/**
 * This test only checks whether the search event is triggred
 * when the Enter key is pressed.
 * It DOES NOT check whether the search event behaves correctly.
 */
test('Search event is triggered correctly', () => {

    var search: HTMLInputElement | null = null;

    // Get the buttons from the DOM
    if (container !== null) {
        search = (getByTestId(container, "search") as HTMLInputElement);
    }

    act(() => {
        if (search !== null) {
            fireEvent.keyPress(search, { key: 'Enter', keyCode: 13, which: 13 });
            fireEvent.keyPress(search, { key: 'Enter', keyCode: 13, which: 13 });
        }
    });

    expect(search).toBeTruthy();
    // The mock search function just console.logs "Search" when Enter is pressed
    // expect(window.location.pathname).toEqual("/node");
    expect(searchSpy).toHaveBeenCalledTimes(2);
});