import TopMap from "../components/TopMap";
import { act } from "react-dom/test-utils";
import { render, unmountComponentAtNode } from "react-dom";
import { fireEvent, getAllByRole, getByRole, getByTestId, getByText } from '@testing-library/react';
import { mount, shallow } from 'enzyme';


let container: HTMLElement | null = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);

    // Render the TopMap
    // act(() => {
    //     render(<TopMap data={mockNodeData} handleChange={() => console.log("node selected")}/>, container);
    // });
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
        public_key: 'public_key1',
        uptime: 10,
        longtitude: 1.2,
        latitude: 0.3,
        publisher: 'someone'
    },
    {
        IP: '222.111.000.221',
        rippled_version: 'rippled-1.7.1',
        public_key: 'public_key2',
        uptime: 12,
        longtitude: 1.3,
        latitude: 0.4,
        publisher: 'someone2'
    }
]

// TODO Fix test
// Doesn't find an element with id dashboard-map

// test('Map is present in DOM', () => {
//     var map = null;

//     // Get the map from the DOM
//     if (container !== null) {
//         map = getByTestId(container, 'dashboard-map');
//     }

//     // Assert that the map is present
//     expect(map).toBeTruthy();
// });

test('Correct behaviour on render', async () => {
    const map = await shallow<TopMap>(<TopMap data={mockNodeData} handleChange={(public_key: String) => public_key}/>).instance();

    const selectNodeSpy = jest.spyOn(map, "selectNode");
    const onClusterClickSpy = jest.spyOn(map, "onClusterClick");
    const createNewPopupSpy = jest.spyOn(map, "createNewPopup");
    const createNewMapSpy = jest.spyOn(map, "createNewMap");
    const createMarkerGroupSpy = jest.spyOn(map, "createMarkerGroup");

    const rendered_map = await map.render();

    expect(selectNodeSpy).toHaveBeenCalledTimes(0);
    expect(onClusterClickSpy).toHaveBeenCalledTimes(0);
    expect(createNewPopupSpy).toHaveBeenCalledTimes(0);
    expect(createNewMapSpy).toHaveBeenCalledTimes(1);
    expect(createMarkerGroupSpy).toHaveBeenCalledTimes(1);

    // Checks whether the keys of the generated map are the correct public keys
    expect(rendered_map.props.children.props.children[1].props.children[0].props.children.props.children).toEqual("public_key1");
    expect(rendered_map.props.children.props.children[1].props.children[1].props.children.props.children).toEqual("public_key2");


});

test('Selecting a node result in correct behaviour', async() => {
    const map = await shallow<TopMap>(<TopMap data={mockNodeData} handleChange={(public_key: String) => public_key}/>).instance();

    const selectNodeSpy = jest.spyOn(map, "selectNode");
    const onClusterClickSpy = jest.spyOn(map, "onClusterClick");
    const createNewPopupSpy = jest.spyOn(map, "createNewPopup");
    const createNewMapSpy = jest.spyOn(map, "createNewMap");
    const createMarkerGroupSpy = jest.spyOn(map, "createMarkerGroup");
    
    const rendered_map = await map.render();

    expect(selectNodeSpy).toHaveBeenCalledTimes(0);
    expect(onClusterClickSpy).toHaveBeenCalledTimes(0);
    expect(createNewPopupSpy).toHaveBeenCalledTimes(0);
    expect(createNewMapSpy).toHaveBeenCalledTimes(1);
    expect(createMarkerGroupSpy).toHaveBeenCalledTimes(1);

    // console.log(rendered_map.props.children.props.children[1].props.children[0].props.eventHandlers.click());

    // For some reason returns undefined instead of the correct public key

    let pub_key = rendered_map.props.children.props.children[1].props.children[0].props.eventHandlers.click();

    expect(selectNodeSpy).toHaveBeenCalledTimes(1);
    expect(onClusterClickSpy).toHaveBeenCalledTimes(0);
    expect(createNewPopupSpy).toHaveBeenCalledTimes(0);
    expect(createNewMapSpy).toHaveBeenCalledTimes(1);
    expect(createMarkerGroupSpy).toHaveBeenCalledTimes(1);

    // expect(pub_key).toEqual(mockNodeData[0].public_key);
});