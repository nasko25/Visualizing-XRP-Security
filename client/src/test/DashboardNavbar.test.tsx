import { createBrowserHistory, History } from 'history';
import React from "react";
import { getByTestId } from '@testing-library/react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

let container: HTMLElement | null = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Render the DashboardNavbar
    act(() => {
        render(<DashboardNavbar
            history={DashboardNavbarPropsMock.history}>
            </DashboardNavbar>, container);
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

const DashboardNavbarPropsMock = {
    history: createBrowserHistory()
}

test('All buttons are present in DOM', () => {

    var buttonValidators = null;
    var buttonAbout = null;

    // Get the buttons from the DOM
    if (container !== null) {
        buttonValidators = getByTestId(container, "validators-button");
        buttonAbout = getByTestId(container, "about-button");
    }

    // Assert that all the buttons are present
    expect(buttonValidators).toBeTruthy();
    expect(buttonAbout).toBeTruthy();
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

    if (buttonValidators !== null){
        // Simulate button click
        act(() => {
            buttonValidators?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // Check that the history has updated
        expect(DashboardNavbarPropsMock.history.location.pathname).toEqual('/validators');
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

    if (buttonAbout !== null){
        // Simulate button click
        act(() => {
            buttonAbout?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // Check that the history has updated
        expect(DashboardNavbarPropsMock.history.location.pathname).toEqual('/about');
    }
});