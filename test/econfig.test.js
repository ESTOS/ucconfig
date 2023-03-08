/* eslint-disable @typescript-eslint/no-var-requires */

const EConfigTemplate = require("../lib/econfig").EConfigTemplate;
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
};

describe("Test EConfig", () => {
	beforeEach(() => {
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
		// eslint-disable-next-line no-template-curly-in-string
		process.env[TEST_ENVS.TEST_ENVIRONMENT_REPLACE("TEST")] = "USERDNSDOMAIN:${USERDNSDOMAIN}";
		// eslint-disable-next-line no-template-curly-in-string
		process.env[TEST_ENVS.TEST_ENVIRONMENT_REPLACE_FAILED("TEST")] = "USERDNSDOMAIN:${USER_DNS_DOMAIN}";

		// eslint-disable-next-line require-jsdoc
		class TestConfig extends EConfigTemplate {
			constructor(envPrefix) {
				super(envPrefix, true);
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

		const testConfig = new TestConfig("TEST");
		testConfig.init(false);
		const errors = testConfig.validate(false);
		expect(errors).toEqual(
			{
				// eslint-disable-next-line no-template-curly-in-string
				invalidPropertyValues: ["TEST_ENVIRONMENT_REPLACE_FAILED requires the following environment variable(s) ${USER_DNS_DOMAIN} which were not available."],
				missingProperties: []
			}
		);

		expect(testConfig.config.testEnvReplace1).toBe("USERDNSDOMAIN:ESTOS.DE");
		expect(testConfig.config.testEnvReplace2).toBe("USERDNSDOMAIN:ESTOS.DE");
		expect(testConfig.config.testEnvReplaceFailed1).toBe("USERDNSDOMAIN:");
		expect(testConfig.config.testEnvReplaceFailed2).toBe(null);
	});

	it("Test required, optional and fallbacks", () => {
		setValidCore("TEST");
		process.env.TEST_URL_VALID = "https://estos.de";
		process.env.TEST_URL_INVALID = "ttp/est....os.de";

		// eslint-disable-next-line require-jsdoc
		class TestConfig extends EConfigTemplate {
			constructor(envPrefix) {
				super(envPrefix, true);
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

		const testConfig = new TestConfig("TEST");
		testConfig.init(false);
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
});
