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

    await dashboard.getData();

    expect(dashboard.state).toHaveProperty('nodes', mockNodeData);
}); 
