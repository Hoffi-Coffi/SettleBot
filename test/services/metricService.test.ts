import {MetricService} from "./../../src/services/metricService";
import {MetricHandler} from "./../../src/handlers/metricHandler";

jest.mock('./../../src/handlers/metricHandler');

var instance: MetricService;

beforeEach(() => {
    instance = new MetricService(new MetricHandler(null), null);
});

describe("uptime", () => {
    test("replies correctly", () => {
        var result = instance.uptime();

        expect(result).toBe("I woke up a few seconds ago!");
    });
});

describe("getMetrics", () => {
    test("replies correctly", () => {
        var result = instance.getMetrics();

        expect(result).toBe("I have seen 1 message and scanned a total of 2 words! Of those, I've found 1 filtered word. I've deleted 1 message. I've muted 1 person automatically, and 1 person on behalf of moderators.");
    });
});