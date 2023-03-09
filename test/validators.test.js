const { validateURL, validateFolderExists, validateString, validateBoolean, validateInteger, validateStringNotEmpty, validateDate, validateFileExists, validatePartOfList, validatePort, validateStringArray, validateIPv4, validateIPv6, validateIP } = require("../lib/validators");

/**
 * Creates a test property
 * @param {*} data the data to merge into the object
 * @returns the test property
 */
function createProp(data) {
	return {
		envName: "testddummy",
		isRequired: true,
		defaultValue: "testdefaultvalue",
		value: "testvalue",
		errorMissing: false,
		errorInvalid: undefined,
		...data
	};
}

describe("Test Validators", () => {
	it("validateString", () => {
		const a = validateString()(createProp({ value: "string" }));
		expect(a).toBe("string");
		const empty = validateString()(createProp({ value: "" }));
		expect(empty).toBe("");
		const blank = validateString()({ });
		expect(blank).toBe(null);
		const nullobject = validateString()();
		expect(nullobject).toBe(null);
	});

	it("validateStringToUpper", () => {
		const a = validateString("toupper")(createProp({ value: "string" }));
		expect(a).toBe("STRING");
	});

	it("validateStringToLower", () => {
		const a = validateString("tolower")(createProp({ value: "STRING" }));
		expect(a).toBe("string");
	});

	it("validateStringNotEmpty", () => {
		const a = validateStringNotEmpty()(createProp({ value: "abc" }));
		expect(a).toBe("abc");
		const b = validateStringNotEmpty()(createProp({ value: "" }));
		expect(b).toBe(null);
		const empty = validateStringNotEmpty()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateStringNotEmpty()({ });
		expect(blank).toBe(null);
		const nullobject = validateStringNotEmpty()();
		expect(nullobject).toBe(null);
	});

	it("validateDate", () => {
		const now = new Date();
		const a = validateDate()(createProp({ value: now.toISOString() }));
		expect(a).toEqual(now);
		const b = validateDate()(createProp({ value: "32.01.2021" }));
		expect(b).toEqual(null);
		const c = validateDate()(createProp({ value: "dd-MMM-yyy" }));
		expect(c).toEqual(null);
		const empty = validateDate()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateDate()({ });
		expect(blank).toBe(null);
		const nullobject = validateDate()();
		expect(nullobject).toBe(null);
	});

	it("validateFileExists", () => {
		const a = validateFileExists()(createProp({ value: "C:\\Windows\\System32\\kernel32.dll" }));
		expect(a).toBe("C:\\Windows\\System32\\kernel32.dll");
		const b = validateFileExists()(createProp({ value: "C:\\Windows\\System32" }));
		expect(b).toBe(null);
		const c = validateFileExists()(createProp({ value: "C:\\Windows\\System32\\kernel33.dll" }));
		expect(c).toBe(null);
		const empty = validateFileExists()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateFileExists()({ });
		expect(blank).toBe(null);
		const nullobject = validateFileExists()();
		expect(nullobject).toBe(null);
	});

	it("validateFolderExists", () => {
		const a = validateFolderExists()(createProp({ value: "C:\\Windows\\System32" }));
		expect(a).toBe("C:\\Windows\\System32");
		const b = validateFolderExists()(createProp({ value: "C:\\Windows\\System32\\" }));
		expect(b).toBe("C:\\Windows\\System32");
		const c = validateFolderExists()(createProp({ value: "C:\\Windows\\System23" }));
		expect(c).toBe(null);
		const d = validateFolderExists()(createProp({ value: "C:\\Windows\\System32\\kernel32.dll" }));
		expect(d).toBe(null);
		const e = validateFolderExists()(createProp({ value: "C:\\Windows\\System32\\kernel33.dll" }));
		expect(e).toBe(null);
		const empty = validateFolderExists()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateFolderExists()({ });
		expect(blank).toBe(null);
		const nullobject = validateFolderExists()();
		expect(nullobject).toBe(null);
	});

	it("validateURL", () => {
		const a = validateURL()(createProp({ value: "https://estos.de" }));
		expect(a.toString()).toBe("https://estos.de/");
		const b = validateURL()(createProp({ value: "https://estos.de/" }));
		expect(b.toString()).toBe("https://estos.de/");
		const c = validateURL()(createProp({ value: "https//estos.de" }));
		expect(c).toBe(null);
		const empty = validateURL()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateURL()({ });
		expect(blank).toBe(null);
		const nullobject = validateURL()();
		expect(nullobject).toBe(null);
	});

	it("validateBoolean", () => {
		const a = validateBoolean()(createProp({ value: "true" }));
		expect(a).toBe(true);
		const b = validateBoolean()(createProp({ value: "false" }));
		expect(b).toBe(false);
		const c = validateBoolean()(createProp({ value: "1" }));
		expect(c).toBe(true);
		const d = validateBoolean()(createProp({ value: "0" }));
		expect(d).toBe(false);
		const e = validateBoolean()(createProp({ value: 0 }));
		expect(e).toBe(null);
		const empty = validateBoolean()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateBoolean()({ });
		expect(blank).toBe(null);
		const nullobject = validateBoolean()();
		expect(nullobject).toBe(null);
	});

	it("validatePartOfList", () => {
		const allowed = ["a", "b", "c"];
		const a = validatePartOfList(allowed)(createProp({ value: "a" }));
		expect(a).toBe("a");
		const b = validatePartOfList(allowed)(createProp({ value: "d" }));
		expect(b).toBe(null);
		const empty = validatePartOfList()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validatePartOfList()({ });
		expect(blank).toBe(null);
		const nullobject = validatePartOfList()();
		expect(nullobject).toBe(null);
	});

	it("validateInteger", () => {
		const a = validateInteger()(createProp({ value: "42" }));
		expect(a).toBe(42);
		const b = validateInteger()(createProp({ value: "0" }));
		expect(b).toBe(0);
		const c = validateInteger()(createProp({ value: "-1" }));
		expect(c).toBe(-1);
		const d = validateInteger()(createProp({ value: "NaN" }));
		expect(d).toBe(null);
		const e = validateInteger()(createProp({ value: "3.14159" }));
		expect(e).toBe(3);
		const empty = validateInteger()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateInteger()({ });
		expect(blank).toBe(null);
		const nullobject = validateInteger()();
		expect(nullobject).toBe(null);
	});

	it("validatePort", () => {
		const a = validatePort()(createProp({ value: "42" }));
		expect(a).toBe(42);
		const b = validatePort()(createProp({ value: "0" }));
		expect(b).toBe(0);
		const c = validatePort()(createProp({ value: "65535" }));
		expect(c).toBe(65535);
		const d = validatePort()(createProp({ value: "65536" }));
		expect(d).toBe(null);
		const e = validatePort()(createProp({ value: "-1" }));
		expect(e).toBe(null);
		const empty = validatePort()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validatePort()({ });
		expect(blank).toBe(null);
		const nullobject = validatePort()();
		expect(nullobject).toBe(null);
	});

	it("validateIPv4", () => {
		const a = validateIPv4()(createProp({ value: "1.2.3.4" }));
		expect(a).toBe("1.2.3.4");
		const b = validateIPv4()(createProp({ value: "255.255.255.255" }));
		expect(b).toBe("255.255.255.255");
		const c = validateIPv4()(createProp({ value: "0.0.0.0" }));
		expect(c).toBe("0.0.0.0");
		const d = validateIPv4()(createProp({ value: "1.2.3" }));
		expect(d).toBe(null);
		const e = validateIPv4()(createProp({ value: "1.2.3.4.5" }));
		expect(e).toBe(null);
		const f = validateIPv4()(createProp({ value: "256.0.0.1" }));
		expect(f).toBe(null);
		const g = validateIPv4()(createProp({ value: 1 }));
		expect(g).toBe(null);
		const empty = validateIPv4()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateIPv4()({ });
		expect(blank).toBe(null);
		const nullobject = validateIPv4()();
		expect(nullobject).toBe(null);
	});

	it("validateIPv6", () => {
		const a = validateIPv6()(createProp({ value: "::1" }));
		expect(a).toBe("::1");
		const b = validateIPv6()(createProp({ value: "fe80::1" }));
		expect(b).toBe("fe80::1");
		const c = validateIPv6()(createProp({ value: "2001:0db8:0000:0000:0000:ff00:0042:8329" }));
		expect(c).toBe("2001:0db8:0000:0000:0000:ff00:0042:8329");
		const e = validateIPv6()(createProp({ value: "A:B:C:D:E:F:G" }));
		expect(e).toBe(null);
		const f = validateIPv6()(createProp({ value: "256.0.0.1" }));
		expect(f).toBe(null);
		const g = validateIPv6()(createProp({ value: 1 }));
		expect(g).toBe(null);
		const empty = validateIPv6()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateIPv6()({ });
		expect(blank).toBe(null);
		const nullobject = validateIPv6()();
		expect(nullobject).toBe(null);
	});

	it("validateIP", () => {
		const a = validateIP()(createProp({ value: "::1" }));
		expect(a).toBe("::1");
		const b = validateIP()(createProp({ value: "127.0.0.1" }));
		expect(b).toBe("127.0.0.1");
		const c = validateIP()(createProp({ value: "" }));
		expect(c).toBe(null);
	});

	it("validateStringArray", () => {
		const a = validateStringArray(";")(createProp({ value: "42" }));
		expect(a).toEqual(["42"]);
		const b = validateStringArray(";")(createProp({ value: "0" }));
		expect(b).toEqual(["0"]);
		const c = validateStringArray(";")(createProp({ value: "42;41;40" }));
		expect(c).toEqual(["42", "41", "40"]);
		const d = validateStringArray(";")(createProp({ value: 1 }));
		expect(d).toBe(null);
		const empty = validateStringArray()(createProp({ value: "" }));
		expect(empty).toBe(null);
		const blank = validateStringArray()({ });
		expect(blank).toBe(null);
		const nullobject = validateStringArray()();
		expect(nullobject).toBe(null);
	});
});
