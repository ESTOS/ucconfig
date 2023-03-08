const path = require("../../lib/helper/path");

describe("Test path functions", () => {
	it("resolve", () => {
		expect(() => path._test.resolve(null)).toThrowError(TypeError);
		expect(path._test.resolve("aaa", "bbb", "ccc")).toBe("aaa/bbb/ccc");
		expect(path._test.resolve(__dirname, "bbb", "ccc")).toBe(__dirname.replaceAll("\\", "/") + "/bbb/ccc");
		expect(path._test.resolve("aaa", null, "ccc")).toBe("aaa/ccc");
	});
});
