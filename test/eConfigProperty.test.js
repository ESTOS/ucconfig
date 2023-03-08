const EConfigProperty = require("../lib/eConfigProperty");

describe("Test eConfigProperty", () => {
	it("required existing env", () => {
		process.env.EXISTING = "exists";
		const prop = new EConfigProperty("EXISTING");
		expect(prop.isRequired).toBe(true);
		expect(prop.defaultValue).toBe(undefined);
		expect(prop.value).toBe("exists");
		expect(prop.errorMissing).toBe(false);
		expect(prop.errorInvalid).toBe(undefined);
	});
	it("required non existing env", () => {
		const prop = new EConfigProperty("NOT_EXISTING");
		expect(prop.isRequired).toBe(true);
		expect(prop.defaultValue).toBe(undefined);
		expect(prop.value).toBe(undefined);
		expect(prop.errorMissing).toBe(true);
		expect(prop.errorInvalid).toBe(undefined);
	});
	it("optional existing env", () => {
		process.env.EXISTING = "exists";
		const prop = new EConfigProperty("EXISTING", "defaultexists");
		expect(prop.isRequired).toBe(false);
		expect(prop.defaultValue).toBe("defaultexists");
		expect(prop.value).toBe("exists");
		expect(prop.errorMissing).toBe(false);
		expect(prop.errorInvalid).toBe(undefined);
	});
	it("optional non existing env", () => {
		const prop = new EConfigProperty("NOT_EXISTING", "defaultnotexists");
		expect(prop.isRequired).toBe(false);
		expect(prop.defaultValue).toBe("defaultnotexists");
		expect(prop.value).toBe(undefined);
		expect(prop.errorMissing).toBe(true);
		expect(prop.errorInvalid).toBe(undefined);
	});
});
