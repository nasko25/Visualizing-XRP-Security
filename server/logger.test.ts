import Logger from './logger';

test("test logger", () => {
    Logger.transports[0].silent = true
    const error = jest.spyOn(Logger, "error")
    Logger.error("test error");
    expect(error).toHaveBeenCalledTimes(1);
});
