import { info } from "./index";

describe("info function", () => {
  it('should log "Expense Tracker CLI App" to the console', () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    info();
    expect(logSpy).toHaveBeenCalledWith("Expense Tracker CLI App");
    logSpy.mockRestore();
  });
});
