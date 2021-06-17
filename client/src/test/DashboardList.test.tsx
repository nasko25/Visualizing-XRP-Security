import { createBrowserHistory, History } from 'history';
import { getAllByRole, getByTestId, getByText } from '@testing-library/react';
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import DashboardList from '../components/dashboard/DashboardList';

let container: HTMLElement | null = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Render the DashboardList
    act(() => {
        render(<DashboardList
            arrNodesData={DashboardListPropsMock.arrNodesData}
            selected={DashboardListPropsMock.selected}
            history={DashboardListPropsMock.history}>
            </DashboardList>, container);
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

const mockNodeData: Array<any> = [
    {
        IP: '111.222.000.123',
        rippled_version: 'rippled-1.7.0',
        public_key: 'key',
        uptime: 10,
        longtitude: 1.2,
        latitude: 0.3,
        publisher: 'someone'
    },
    {
        IP: '222.111.000.221',
        rippled_version: 'rippled-1.7.1',
        public_key: 'key2',
        uptime: 12,
        longtitude: 1.3,
        latitude: 0.4,
        publisher: 'someone2'
    }
]

const DashboardListPropsMock = {
    arrNodesData: mockNodeData,
    selected: 'key2',
    history: createBrowserHistory()
}

test('List is present in DOM', () => {

    var list = null;

    // Get the list from the DOM
    if (container !== null) {
        list = getByTestId(container, "dashboard-list");
    }

    // Assert that the list is present
    expect(list).toBeTruthy();
});

test('Click on node in the list triggers correctly onClick event', () => {
    var list: HTMLTableElement | null = null;
    var rows: HTMLCollectionOf<HTMLTableRowElement> | null = null; 
    
    // Get the list from the DOM
    if (container !== null) {
        list = (getByTestId(container, "dashboard-list") as HTMLTableElement);
    }

    // Assert that the list is present
    expect(list).not.toBeNull();
    expect(list).toBeTruthy();

    if (list !== null){
        // Get the rows of the list
        rows = list.rows;

        if (rows !== null) {
            // Simulate button click
            act(() => {
                if (container !== null)
                    getByText(container, "key").dispatchEvent(new MouseEvent("click", { bubbles: true }));
            });
            // Check that the history has updated
            expect(DashboardListPropsMock.history.location.pathname + DashboardListPropsMock.history.location.search).toEqual('/node?public_key=key');
        }
    }
});

test('Selected node is highlighted in the list', () => {

    var list: HTMLTableElement | null = null;
    var rows: HTMLCollectionOf<HTMLTableRowElement> | null = null;
    // var el: HTMLTableCellElement | null = null;
    var el: HTMLElement | null = null;  

    // Get the list from the DOM
    if (container !== null) {
        list = (getByTestId(container, "dashboard-list") as HTMLTableElement);
    }

    // Assert that the list is present
    expect(list).not.toBeNull();
    expect(list).toBeTruthy();

    if (list !== null){
        // Get the rows of the list
        rows = list.rows;

        if (container !== null) {
            el = getAllByRole(container, "rowheader")[0];
            
            expect(el.textContent).toEqual(mockNodeData[1].public_key);    
        }    
    }
});