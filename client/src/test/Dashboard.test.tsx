import Dashboard from './../components/dashboard/Dashboard';
import axios from 'axios';
import { createBrowserHistory, History } from 'history';
import { mount, shallow } from 'enzyme';

//---------------SETUP AND CLEAN UP---------------//

// Mock axios
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

afterEach(() => {
    jest.clearAllMocks;
});

const mockNodeData: Object[] = [
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

const mockData = {
    data: mockNodeData
}


test('Correct behavior on API get all nodes success', async () => {

    axiosMock.get.mockResolvedValue(mockData);

    let history: History = createBrowserHistory();
    history.push('/');
    const dashboard = await shallow<Dashboard>(<Dashboard history={history} />).instance();

    const componentDidMountSpy = jest.spyOn(dashboard, "componentDidMount");
    const setStateSpy = jest.spyOn(dashboard, "setState");
    const getDataSpy = jest.spyOn(dashboard, "getData");
    const refreshDataSpy = jest.spyOn(dashboard, "refresh_data");

    await dashboard.getData();

    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(3);
    expect(getDataSpy).toHaveBeenCalledTimes(1);
    expect(refreshDataSpy).toHaveBeenCalledTimes(0);

    expect(dashboard.state).toHaveProperty('nodes', mockNodeData);
    expect(dashboard.state).toHaveProperty('loaded', true);
    expect(dashboard.state).toHaveProperty('selected', "");
});

test('Correct behaviour on API get all nodes failure', async () => {

    // Mock axious response as a failed request response
    axiosMock.get.mockRejectedValue(new Error('404 Not Found'));

    let history: History = createBrowserHistory();
    history.push('/');
    const dashboard = await shallow<Dashboard>(<Dashboard history={history} />).instance();

    const componentDidMountSpy = jest.spyOn(dashboard, "componentDidMount");
    const setStateSpy = jest.spyOn(dashboard, "setState");
    const getDataSpy = jest.spyOn(dashboard, "getData");
    const refreshDataSpy = jest.spyOn(dashboard, "refresh_data");

    await dashboard.getData();

    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(0);
    expect(getDataSpy).toHaveBeenCalledTimes(1);
    expect(refreshDataSpy).toHaveBeenCalledTimes(0);

    expect(dashboard.state).toHaveProperty('nodes', []);
    expect(dashboard.state).toHaveProperty('loaded', false);
    expect(dashboard.state).toHaveProperty('selected', "");
});


test('Select node', async () => {

    axiosMock.get.mockResolvedValue(mockData);

    let history: History = createBrowserHistory();
    history.push('/');
    const dashboard = await shallow<Dashboard>(<Dashboard history={history} />).instance();

    const selectNodeSpy = jest.spyOn(dashboard, 'selectNode');
    const componentDidMountSpy = jest.spyOn(dashboard, "componentDidMount");
    const setStateSpy = jest.spyOn(dashboard, "setState");
    const refreshDataSpy = jest.spyOn(dashboard, "refresh_data");

    await dashboard.selectNode("somepublickey");

    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(2);
    expect(selectNodeSpy).toHaveBeenCalledTimes(1);
    expect(refreshDataSpy).toHaveBeenCalledTimes(0);

    expect(dashboard.state).toHaveProperty('nodes', mockNodeData);
    expect(dashboard.state).toHaveProperty('loaded', true);
    expect(dashboard.state).toHaveProperty('selected', "somepublickey");
});


// TODO The test will be changed once we have completed the section with general information
test('Create gen info', async () => {

    axiosMock.get.mockResolvedValue(mockData);

    let history: History = createBrowserHistory();
    history.push('/');
    const dashboard = await shallow<Dashboard>(<Dashboard history={history} />).instance();

    const createGenInfoSpy = jest.spyOn(dashboard, 'createGenInfo');
    const componentDidMountSpy = jest.spyOn(dashboard, "componentDidMount");
    const setStateSpy = jest.spyOn(dashboard, "setState");
    const refreshDataSpy = jest.spyOn(dashboard, "refresh_data");

    await dashboard.createGenInfo();

    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(1);
    expect(createGenInfoSpy).toHaveBeenCalledTimes(2);
    expect(refreshDataSpy).toHaveBeenCalledTimes(0);

    expect(dashboard.state).toHaveProperty('nodes', mockNodeData);
    expect(dashboard.state).toHaveProperty('loaded', true);
    expect(dashboard.state).toHaveProperty('selected', "");
});