const EConfigProperty = require("./eConfigProperty");
const validators = require("./validators");

// A dummy console for jest testing
const dummyConsole = {
	error: () => {}
};

/**
 * In case a property is required or optional for a certain environment we can handle that with the EConfigPropertyOptional object
 *
 * If a parameter is optional for a certain environment set this property to true,
 * For the ones where it is specified false the config handler will enforce the existance and report an error
 * The default constructor classifies
 */
class EConfigPropertyOptional {
	// Optional for local development
	static local_development = new EConfigPropertyOptional(true, false, false, false);
	// Optional for production
	static production = new EConfigPropertyOptional(false, true, true, true);
	// Optional for the true flagged ones, mandatory for the other ones
	constructor(local_development, development, staging, production) {
		this._local_development = local_development;
		this._development = development;
		this._staging = staging;
		this._production = production;
	}

	isOptional(coreConfig) {
		if (!coreConfig)
			return false;
		if (coreConfig.development)
			return this._local_development;
		else if (coreConfig.environment === "development")
			return this._development;
		else if (coreConfig.environment === "staging")
			return this._staging;
		else if (coreConfig.environment === "production")
			return this._production;
		return false;
	}
}

/**
 * Represents a configuration instance
 */
class EConfigTemplate {
	constructor(envPrefix = undefined, env = undefined, /* istanbul ignore next */ test = false) {
		this.envPrefix = envPrefix;
		this.env = env || process.env;
		this.coreConfig = undefined;
		this.missingProperties = [];
		this.invalidPropertyValues = [];
		/* istanbul ignore else */
		if (test)
			this.console = dummyConsole;
		else
			this.console = console;
	}

	/**
	 * Internal helper method to creates a config property
	 * optionally replaces environment variables
	 * optionally reports missing environment variables
	 * tracks errors
	 *
	 * @param defaultSet - true if the original caller received a default value or not
	 * @param envName - Name of the environment variable
	 * @param validator - Method to validate and parse property
	 * @param defaultValue - the defaultValue value which is used if the property is not specified in the environment or a helper object EOptionalForEnvironment
	 * @param replaceEnv - if true replaces a environment variable in the string by it´s environment property (e.g. ${COMPUTERNAME}.{DNSDOMAINNAME})
	 * @param mustEnv - if true a environment variable in the string must be replaced, if it is not replace it´s classified as error
	 */
	newPropertyInternal(defaultSet, envName, validator, defaultValue, replaceEnv, mustEnv) {
		if (defaultSet) {
			// Default value has been set, let´s check if it is our helper object
			if (defaultValue instanceof EConfigPropertyOptional) {
				if (defaultValue.isOptional(this.coreConfig))
					defaultValue = undefined;
				else
					defaultSet = false;
			}
		}
		if (this.envPrefix)
			envName = `${this.envPrefix}_${envName}`;
		let prop;
		if (defaultSet)
			prop = new EConfigProperty(this.env, envName, defaultValue);
		else
			prop = new EConfigProperty(this.env, envName);

		if (prop.errorMissing) {
			if (prop.isRequired)
				this.missingProperties.push(prop.envName);
			else
				return defaultValue;
		} else {
			if (replaceEnv) {
				prop.value = prop.value.replace(/\${([A-Z0-9_]*)}/ig, (substring, ...args) => {
					const envvalue = process.env[args[0]];
					if (envvalue)
						return envvalue;
					else if (mustEnv) {
						if (!prop.errorInvalid)
							prop.errorInvalid = `${substring}`;
						else
							prop.errorInvalid += ` ${substring}`;
					}
					return "";
				});
				if (prop.errorInvalid)
					prop.errorInvalid = `${prop.envName} requires the following environment variable(s) ${prop.errorInvalid} which were not available.`;
			}
			let result = null;
			if (!prop.errorInvalid)
				result = validator(prop);
			if (prop.errorInvalid)
				this.invalidPropertyValues.push(prop.errorInvalid);
			return result;
		}
		return undefined;
	}

	/**
	 * Helper method to creates a config property replaces environment variables
	 * (optionally reports missing environment variables) and tracks errors
	 *
	 * @param envName - Name of the environment variable
	 * @param validator - Method to validate and parse property
	 * @param defaultValue - the defaultValue value which is used if the property is not specified in the environment
	 * @param must - if true a environment variable in the string must be replaced, if it is not replace it´s classified as error
	 */
	newEnvProperty(envName, validator, defaultValue, must) {
		return this.newPropertyInternal(arguments.length >= 3, envName, validator, defaultValue, true, must);
	}

	/**
	 * Helper method to creates a config property and tracks errors
	 *
	 * @param envName - Name of the environment variable
	 * @param validator - Method to validate and parse property
	 * @param defaultValue - the defaultValue value which is used if the property is not specified in the environment
	 */
	newProperty(envName, validator, defaultValue) {
		return this.newPropertyInternal(arguments.length >= 3, envName, validator, defaultValue, false, false);
	}

	/**
	 * Validates the current configuration state
	 * Returns errors or stops process
	 */
	validate(/* istanbul ignore next */ exitOnError = true) {
		let propsInvalid = false;
		let propsMissing = false;
		if (this.invalidPropertyValues.length > 0) {
			propsInvalid = true;
			this.console.error(`The following properties are invalid in the environment (.env file):\n - ${this.invalidPropertyValues.join("\n - ")}`);
			this.console.error("Please check the .env.sample for the correct values");
		}

		if (this.missingProperties.length > 0) {
			propsMissing = true;
			this.console.error(`The following properties are missing (or invalid) in the environment (.env file):\n - ${this.missingProperties.join("\n - ")}`);
			this.console.error("Please check the .env.sample for the missing properties");
		}

		if (propsMissing || propsInvalid) {
			/* istanbul ignore if */
			if (exitOnError) {
				this.console.error("Process is going to terminate here. Please check the errors above.");
				if (typeof process.exit === "function")
					process.exit(1);
				else
					throw new Error("Missing or invalid environment property");
			} else {
				return {
					invalidPropertyValues: this.invalidPropertyValues,
					missingProperties: this.missingProperties
				};
			}
		} else
			return null;
	}

	/**
	 * Initialises all probperties
	 * Checks if exists and set correclty
	 */
	initCore() {
		// Reset for each init
		this.missingProperties = [];
		this.invalidPropertyValues = [];

		this.coreConfig = {
			versionBuildDate: this.newProperty("VERSION_BUILD_DATE", validators.validateDate()),
			versionTag: this.newProperty("VERSION_TAG", validators.validateString()),
			environment: this.newProperty("ENVIRONMENT", validators.validatePartOfList(["development", "staging", "production"], "tolower")),
			logLevel: this.newProperty("LOG_LEVEL", validators.validatePartOfList(["debug", "info", "warn", "error"], "tolower")),
			logToConsole: this.newProperty("LOG_TO_CONSOLE", validators.validateBoolean()),
			development: this.newProperty("DEVELOPMENT", validators.validateBoolean(), false)
		};
	}
}

module.exports = {
	EConfigTemplate,
	EConfigPropertyOptional
};
