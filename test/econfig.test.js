/* eslint-disable @typescript-eslint/no-var-requires */

const EConfigTemplate = require("../lib/econfig").EConfigTemplate;
const { EConfigPropertyOptional } = require("../lib/econfig");
const validators = require("../lib/validators");

let config = null;
const envPrefix = "ECONF";
// const defaultEnv = process.env;

/**
 * Test Config implementation
 */
class Config extends EConfigTemplate {
	constructor() {
		super(envPrefix, true);
	}

	init() {
		this.initCore();
	}
}

/**
 * Test Config for the replacing test
 */
class TestConfigReplacing extends EConfigTemplate {
	constructor() {
		super("TEST", true);
		this.config = {
			testEnvReplace: undefined,
			testEnvReplaceFailed: undefined
		};
	}

	init() {
		this.initCore();
		this.config = {
			testEnvReplace1: this.newEnvProperty("ENVIRONMENT_REPLACE", validators.validateStringNotEmpty()),
			testEnvReplace2: this.newEnvProperty("ENVIRONMENT_REPLACE", validators.validateStringNotEmpty(), undefined, true),
			testEnvReplaceFailed1: this.newEnvProperty("ENVIRONMENT_REPLACE_FAILED", validators.validateStringNotEmpty()),
			testEnvReplaceFailed2: this.newEnvProperty("ENVIRONMENT_REPLACE_FAILED", validators.validateStringNotEmpty(), undefined, true)
		};
	}
}

/**
 * Test Config for the required and optional test
 */
class TestConfigRequiredOptional extends EConfigTemplate {
	constructor() {
		super("TEST", true);
		this.config = {
			testValidUrl: undefined,
			testInvalidUrl: undefined,
			testRequiredMissing: undefined,
			testRequiredFallback: undefined,
			testOptional: undefined,
			testOptionalFallback: undefined
		};
	}

	init() {
		this.initCore();
		this.config = {
			testValidUrl: this.newProperty("URL_VALID", validators.validateURL()),
			testInvalidUrl: this.newProperty("URL_INVALID", validators.validateURL()),
			testRequiredMissing: this.newProperty("REQUIRED_MISSING", validators.validateString()),
			testRequiredFallback: this.newProperty("REQUIRED_MISSING_W_FALLBACK", validators.validateString(), "FALLBACK_REQUIRED")
		};
	}
}

/**
 * Test Config for the environment specific optional test
 */
class TestConfigProductionOptional extends EConfigTemplate {
	constructor() {
		super("TEST", true);
	}
	init() {
		this.initCore();
		this.config = {
			parameter: this.newProperty("PARAMETER", validators.validateBoolean(), EConfigPropertyOptional.production)
		};
	}
}

/**
 * Test Config for the environment specific optional test
 */
class TestConfigLocalDevelopmentOptional extends EConfigTemplate {
	constructor() {
		super("TEST", true);
	}
	init() {
		this.initCore();
		this.config = {
			parameter: this.newProperty("PARAMETER", validators.validateBoolean(), EConfigPropertyOptional.local_development)
		};
	}
}


const TEST_ENVS = {
	VERSION_BUILD_DATE: (envPrefix) => `${envPrefix}_VERSION_BUILD_DATE`,
	VERSION_TAG: (envPrefix) => `${envPrefix}_VERSION_TAG`,
	ENVIRONMENT: (envPrefix) => `${envPrefix}_ENVIRONMENT`,
	LOG_LEVEL: (envPrefix) => `${envPrefix}_LOG_LEVEL`,
	LOG_TO_CONSOLE: (envPrefix) => `${envPrefix}_LOG_TO_CONSOLE`,
	TEST_URL_VALID: (envPrefix) => `${envPrefix}_URL_VALID`,
	TEST_URL_INVALID: (envPrefix) => `${envPrefix}_URL_INVALID`,
	TEST_ENVIRONMENT_REPLACE: (envPrefix) => `${envPrefix}_ENVIRONMENT_REPLACE`,
	TEST_ENVIRONMENT_REPLACE_FAILED: (envPrefix) => `${envPrefix}_ENVIRONMENT_REPLACE_FAILED`
};

const setValidCore = function(envPrefix) {
	process.env[`${envPrefix}_VERSION_BUILD_DATE`] = "5/23/2021";
	process.env[`${envPrefix}_VERSION_TAG`] = "1.0.0";
	process.env[`${envPrefix}_ENVIRONMENT`] = "production";
	process.env[`${envPrefix}_LOG_LEVEL`] = "debug";
	process.env[`${envPrefix}_LOG_TO_CONSOLE`] = "1";
	process.env[`${envPrefix}_DEVELOPMENT`] = "0";
};

describe("Test EConfig", () => {
	beforeEach(() => {
		// Wipe environment, no test should rely on another one or any existing stuff in the environment
		process.env = [];
		config = new Config(envPrefix);
		// Clear all known ENV
		for (const [key] of Object.entries(TEST_ENVS))
			delete process.env[key];
	});

	it("Default unitialised config", () => {
		config.init();
		const errors = config.validate(false);

		// Expect to fail of missing default properties
		const shallBe = {
			invalidPropertyValues: [],
			missingProperties: [
				TEST_ENVS.VERSION_BUILD_DATE("ECONF"),
				TEST_ENVS.VERSION_TAG("ECONF"),
				TEST_ENVS.ENVIRONMENT("ECONF"),
				TEST_ENVS.LOG_LEVEL("ECONF"),
				TEST_ENVS.LOG_TO_CONSOLE("ECONF")
			]
		};
		expect(errors).toEqual(shallBe);
	});

	it("Default initialised config", () => {
		setValidCore("ECONF");
		config.init();
		const errors = config.validate(false);
		expect(errors).toEqual(null);
	});

	it("Test environment property replacing", () => {
		setValidCore("TEST");
		process.env["TESTSTRING"] = "REPLACESTRING";
		// eslint-disable-next-line no-template-curly-in-string
		process.env[TEST_ENVS.TEST_ENVIRONMENT_REPLACE("TEST")] = "TESTSTRING:${TESTSTRING}";
		// eslint-disable-next-line no-template-curly-in-string
		process.env[TEST_ENVS.TEST_ENVIRONMENT_REPLACE_FAILED("TEST")] = "TESTSTRING:${TEST_STRING}";

		const testConfig = new TestConfigReplacing();
		testConfig.init();
		const errors = testConfig.validate(false);
		expect(errors).toEqual(
			{
				// eslint-disable-next-line no-template-curly-in-string
				invalidPropertyValues: ["TEST_ENVIRONMENT_REPLACE_FAILED requires the following environment variable(s) ${TEST_STRING} which were not available."],
				missingProperties: []
			}
		);

		expect(testConfig.config.testEnvReplace1).toBe("TESTSTRING:REPLACESTRING");
		expect(testConfig.config.testEnvReplace2).toBe("TESTSTRING:REPLACESTRING");
		expect(testConfig.config.testEnvReplaceFailed1).toBe("TESTSTRING:");
		expect(testConfig.config.testEnvReplaceFailed2).toBe(null);
	});

	it("Test required, optional and fallbacks", () => {
		setValidCore("TEST");
		process.env.TEST_URL_VALID = "https://estos.de";
		process.env.TEST_URL_INVALID = "ttp/est....os.de";

		const testConfig = new TestConfigRequiredOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
		expect(errors).toEqual(
			{
				invalidPropertyValues: ["TEST_URL_INVALID invalid URL (ttp/est....os.de). Exception: Invalid URL"],
				missingProperties: ["TEST_REQUIRED_MISSING"]
			}
		);

		expect(testConfig.config.testValidUrl.href).toBe("https://estos.de/");
		expect(testConfig.config.testInvalidUrl).toBeNull();
		expect(testConfig.config.testRequiredMissing).toBeUndefined();
		expect(testConfig.config.testOptional).toBe(undefined);
		expect(testConfig.config.testRequiredFallback).toBe("FALLBACK_REQUIRED");
		expect(testConfig.config.testOptionalFallback).toBe(undefined);
	});

	it("Test environment variable self replace", () => {
		// eslint-disable-next-line no-template-curly-in-string
		process.env.TEST_URL_ENV_REPLACE_POSSIBLE = "replace:${TEST_URL_ENV_REPLACER}";
		// eslint-disable-next-line no-template-curly-in-string
		process.env.TEST_URL_ENV_REPLACE_NOTPOSSIBLE = "replace:${TEST_URL_ENV_REPLACER_NOT_EXISTING_1}:${TEST_URL_ENV_REPLACER_NOT_EXISTING_2}";
		process.env.TEST_URL_ENV_REPLACER = "it";
		const template = new EConfigTemplate(undefined, true);
		{
			const prop = template.newEnvProperty("TEST_URL_ENV_REPLACE_POSSIBLE", validators.validateString(), undefined, true);
			expect(prop).toBe("replace:it");
		}
		{
			const prop = template.newEnvProperty("TEST_URL_ENV_REPLACE_NOTPOSSIBLE", validators.validateString(), undefined, true);
			expect(prop).toBeNull();
		}
		{
			const prop = template.newEnvProperty("TEST_URL_ENV_REPLACE_NOTPOSSIBLE", validators.validateString(), undefined, false);
			expect(prop).toBe("replace::");
		}
	});

	// Test against matching environment
	it("Test parameter optional in production, env is production and set", () => {
		setValidCore("TEST");
		const testConfig = new TestConfigProductionOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
	});

	it("Test parameter optional in production, env is production and not set", () => {
		setValidCore("TEST");
		const testConfig = new TestConfigProductionOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
		expect(errors).toBeNull();
	});

	it("Test parameter optional in production, env is production and set valid", () => {
		setValidCore("TEST");
		process.env[`TEST_PARAMETER`] = "true";
		const testConfig = new TestConfigProductionOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
		expect(errors).toBeNull();
	});

	it("Test parameter optional in production, env is production and set wrong type", () => {
		setValidCore("TEST");
		process.env[`TEST_PARAMETER`] = "shoudlbeboolean";
		const testConfig = new TestConfigProductionOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
		expect(errors).toEqual(
			{
				invalidPropertyValues: ['TEST_PARAMETER has to be of type "1" (true) or "0" (false), currently is (shoudlbeboolean)'],
				missingProperties: []
			}
		);
	});

	// Test against not matching environment (development)

	it("Test parameter optional in production, env is development and set", () => {
		setValidCore("TEST");
		process.env[`${envPrefix}_ENVIRONMENT`] = "development";
		const testConfig = new TestConfigProductionOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
	});

	it("Test parameter optional in production, env is development and not set", () => {
		setValidCore("TEST");
		process.env[`${envPrefix}_ENVIRONMENT`] = "development";
		const testConfig = new TestConfigProductionOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
		expect(errors).toBeNull();
	});

	it("Test parameter optional in production, env is development and set valid", () => {
		setValidCore("TEST");
		process.env[`${envPrefix}_ENVIRONMENT`] = "development";
		process.env[`TEST_PARAMETER`] = "true";
		const testConfig = new TestConfigProductionOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
		expect(errors).toBeNull();
	});

	it("Test parameter optional in production, env is development and set wrong type", () => {
		setValidCore("TEST");
		process.env[`${envPrefix}_ENVIRONMENT`] = "development";
		process.env[`TEST_PARAMETER`] = "shoudlbeboolean";
		const testConfig = new TestConfigProductionOptional();
		testConfig.init();
		const errors = testConfig.validate(false);
		expect(errors).toEqual(
			{
				invalidPropertyValues: ['TEST_PARAMETER has to be of type "1" (true) or "0" (false), currently is (shoudlbeboolean)'],
				missingProperties: []
			}
		);
	});
});
