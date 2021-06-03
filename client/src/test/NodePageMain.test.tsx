import { render, screen } from '@testing-library/react';
import App from '../App';
import { unmountComponentAtNode } from 'react-dom';
import NodePeerGraph from '../components/node-page/NodePeerGraph';
import NodePageMain from '../components/node-page/NodePageMain';
import axios from 'axios';
import '../components/node-page/NodePageTypes'
import { createBrowserHistory } from 'history';
import React, { Component } from "react";

//---------------SETUP AND CLEAN UP---------------//

// Mock axios
jest.mock("../components/node-page/NodePeerGraph");
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

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
});

test('Correct behavior on API peer call success', () => {
    axiosMock.get.mockResolvedValue("{public_key: bruh}");
    render(<NodePageMain history={createBrowserHistory()} />);
    // const linkElement = screen.getByText(/CISELab/i);
    // expect(linkElement).toBeInTheDocument();
});
