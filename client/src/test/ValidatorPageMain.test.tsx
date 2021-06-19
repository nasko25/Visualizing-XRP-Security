import ValidatorPageMain from '../components/validator-page/ValidatorPageMain'; 
import axios from 'axios';
import { createBrowserHistory, History } from 'history';
import { shallow } from 'enzyme';
import { Validator } from '../components/validator-page/ValidatorPageTypes';

//---------------SETUP AND CLEAN UP---------------//

// Mock axios
jest.mock("axios");
const axiosMock = axios as jest.Mocked<typeof axios>;

afterEach(() => {
    jest.clearAllMocks();
});

const mockValidatorData: Validator[] = [{
    history: [{
        timestamp: '11-1-1111',
        score: 1
    }],
    public_key: 'public_key',
    score: '1',
    timestamp: '11-1-1111' 
}];

const mockData = {
    data: mockValidatorData
}

test('Correct behaviour on API validator info call success', async () => {
    // Mock the axios response as resolution
    axiosMock.get.mockResolvedValue(mockData);    

    // Shallowly render the Validator page
    let history: History = createBrowserHistory();
    history.push('/validators');

    const validator_page = await shallow<ValidatorPageMain>(<ValidatorPageMain history={history} />).instance();

    // Set up some spies
    const componentDidMountSpy = jest.spyOn(validator_page, "componentDidMount");
    const setStateSpy = jest.spyOn(validator_page, "setState");
    const getDataSpy = jest.spyOn(validator_page, "getData");
    const updateInfoSpy = jest.spyOn(validator_page, "updateInfo");

    // Make the call to the function
    await validator_page.getData();
    
    // Make sure nothing is called in excess
    expect(getDataSpy).toHaveBeenCalledTimes(1);
    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalled();
    expect(updateInfoSpy).toHaveBeenCalledTimes(0);


    // See if everything in the state is correctly updated
    expect(validator_page.state.data).toEqual(mockValidatorData);
});

test('Correct behaviour on API validator info call failure', async () => {

    // Mock the axios response as rejection
    axiosMock.get.mockRejectedValue(new Error('404 Not Found'));   

    // Shallowly render the Validator page
    let history: History = createBrowserHistory();
    history.push('/validators');

    const validator_page = await shallow<ValidatorPageMain>(<ValidatorPageMain history={history} />).instance();

    // Set up some spies
    const componentDidMountSpy = jest.spyOn(validator_page, "componentDidMount");
    const setStateSpy = jest.spyOn(validator_page, "setState");
    const getDataSpy = jest.spyOn(validator_page, "getData");
    const updateInfoSpy = jest.spyOn(validator_page, "updateInfo");

    // Make the call to the function
    await validator_page.getData();
    
    // Make sure nothing is called
    expect(getDataSpy).toHaveBeenCalledTimes(1);
    expect(componentDidMountSpy).toHaveBeenCalledTimes(0);
    expect(setStateSpy).toHaveBeenCalledTimes(0);
    expect(updateInfoSpy).toHaveBeenCalledTimes(0);
});