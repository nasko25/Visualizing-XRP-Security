import { createBrowserHistory, History } from 'history';
import { Peer, NodeInfoDB, PeerNodeDB } from '../components/node-page/NodePageTypes';
import { shallow, mount } from 'enzyme';
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

afterEach(() => {
    jest.clearAllMocks();
});

test('All 3 buttons and Search Bar are present', () => {

})