var infoSpy = jest.spyOn(global.console, "info").mockImplementation(() => {});
var warnSpy = jest.spyOn(global.console, "warn").mockImplementation(() => {});
var errorSpy = jest.spyOn(global.console, "error").mockImplementation(() => {});

import {Logger} from "./../../src/utilities/logger";

var _logger = new Logger();

describe("logger", () => {
    describe(".info", () => {
        test("uses the correct console log func", () => {
            _logger.info("test", "logger.test.ts");

            expect(infoSpy).toHaveBeenCalledTimes(1);
        });

        test("prints the correct log level", () => {
            _logger.info("test", "logger.test.ts");

            expect(infoSpy).toHaveBeenCalledTimes(1);
            expect(infoSpy.mock.calls[0][0]).toContain("INFO");
        });

        test("contains the correct message", () => {
            _logger.info("jest", "logger.test.ts");

            expect(infoSpy).toHaveBeenCalledTimes(1);
            expect(infoSpy.mock.calls[0][0]).toContain("jest");
        });

        test("contains the calling module when provided", () => {
            _logger.info("test", "logger.test.ts");

            expect(infoSpy).toHaveBeenCalledTimes(1);
            expect(infoSpy.mock.calls[0][0]).toContain("logger.test.ts");
        });

        test("does NOT contain the calling module when not provided", () => {
            _logger.info("test");

            expect(infoSpy).toHaveBeenCalledTimes(1);
            expect(infoSpy.mock.calls[0][0]).not.toContain("logger.test.ts");
        });

        afterEach(() => {
            infoSpy.mockReset();
        });
    });

    describe(".warn", () => {
        test("uses the correct console log func", () => {
            _logger.warn("test", "logger.test.ts");

            expect(warnSpy).toHaveBeenCalledTimes(1);
        });

        test("prints the correct log level", () => {
            _logger.warn("test", "logger.test.ts");

            expect(warnSpy).toHaveBeenCalledTimes(1);
            expect(warnSpy.mock.calls[0][0]).toContain("WARN");
        });

        test("contains the correct message", () => {
            _logger.warn("jest", "logger.test.ts");

            expect(warnSpy).toHaveBeenCalledTimes(1);
            expect(warnSpy.mock.calls[0][0]).toContain("jest");
        });

        test("contains the calling module when provided", () => {
            _logger.warn("test", "logger.test.ts");

            expect(warnSpy).toHaveBeenCalledTimes(1);
            expect(warnSpy.mock.calls[0][0]).toContain("logger.test.ts");
        });

        test("does NOT contain the calling module when not provided", () => {
            _logger.warn("test");

            expect(warnSpy).toHaveBeenCalledTimes(1);
            expect(warnSpy.mock.calls[0][0]).not.toContain("logger.test.ts");
        });

        afterEach(() => {
            warnSpy.mockReset();
        });
    });

    describe(".error", () => {
        test("uses the correct console log func", () => {
            _logger.error("test", "logger.test.ts");

            expect(errorSpy).toHaveBeenCalledTimes(1);
        });

        test("prints the correct log level", () => {
            _logger.error("test", "logger.test.ts");

            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy.mock.calls[0][0]).toContain("ERR");
        });

        test("contains the correct message", () => {
            _logger.error("jest", "logger.test.ts");

            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy.mock.calls[0][0]).toContain("jest");
        });

        test("contains the calling module when provided", () => {
            _logger.error("test", "logger.test.ts");

            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy.mock.calls[0][0]).toContain("logger.test.ts");
        });

        test("does NOT contain the calling module when not provided", () => {
            _logger.error("test");

            expect(errorSpy).toHaveBeenCalledTimes(1);
            expect(errorSpy.mock.calls[0][0]).not.toContain("logger.test.ts");
        });

        afterEach(() => {
            errorSpy.mockReset();
        });
    });

    afterAll(() => {
        infoSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    })
});