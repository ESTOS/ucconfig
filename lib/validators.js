const fs = require("./helper/fs");
const path = require("./helper/path");

/**
 * Checks if the ip-addres is a valid ipv4 addres
 *
 * @returns true on success
 */
function isIPV4(ipv4) {
	const regexExpIPV4 = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;
	return regexExpIPV4.test(ipv4);
}

/**
 * Checks if the ip-addres is a valid ipv6 addres
 *
 * @returns true on success
 */
function isIPV6(ipv6) {
	const regexExpIPV6 = /(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi;
	return regexExpIPV6.test(ipv6);
}

const validators = {
	/**
	 * Helper for ConfigTemplate.validator to check if the given config is a string
	 *
	 * @param convert - "tolower" to make the string lowercase, "toupper" to make it uppercase
	 * @returns the validator function which itself returns - the validated string or an empty string on error
	 */
	validateString: function(convert) {
		return (configProp) => {
			if (!configProp)
				return null;
			if (typeof configProp.value === "string") {
				if (convert === "toupper")
					configProp.value = configProp.value.toUpperCase();
				else if (convert === "tolower")
					configProp.value = configProp.value.toLowerCase();
				return configProp.value;
			}
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.validator to check if the given config is a non empty string
	 *
	 * @param convert - "tolower" to make the string lowercase, "toupper" to make it uppercase
	 * @returns the validator function which itself returns - the validated string or an empty string on error
	 */
	validateStringNotEmpty: function(convert) {
		return (configProp) => {
			if (!configProp)
				return null;
			if (typeof configProp.value === "string" && configProp.value.length > 0) {
				/* istanbul ignore next */
				if (convert === "toupper")
					configProp.value = configProp.value.toUpperCase();
				/* istanbul ignore next */
				else if (convert === "tolower")
					configProp.value = configProp.value.toLowerCase();
				return configProp.value;
			} else
				configProp.errorInvalid = `${configProp.envName} contains an empty string`;
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.validator to check if the given config is a valid Date
	 *
	 * @returns the validator function which itself returns - the parsed Date or new Date() on error
	 */
	validateDate: function() {
		return (configProp) => {
			if (!configProp)
				return null;
			const date = new Date(configProp.value);
			if (date instanceof Date && !isNaN(date))
				return date;
			configProp.errorInvalid = `${configProp.envName} contains invalid date (${configProp.value}).`;
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.validator to check if the file exists which is given as a parameter
	 *
	 * @returns the validator function which itself returns - the filepath as string or and empty string on error
	 */
	validateFileExists: function() {
		return (configProp) => {
			if (!configProp)
				return null;
			let message;
			if (configProp.value) {
				const file = path.resolve(process.cwd(), configProp.value);
				try {
					const stats = fs.lstatSync(file);
					if (stats.isFile())
						return file;
					configProp.errorInvalid = `${configProp.envName} file (${file}) does not exists.`;
				} catch (error) {
					message = error.message;
				}
			}
			configProp.errorInvalid = `${configProp.envName} file (${configProp.value}) does not exists.`;
			if (message)
				configProp.errorInvalid += `Exception: ${message}`;
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.validator to check if a folder exists which is given as a parameter
	 *
	 * @returns the validator function which itself returns - the folderpath as string or and empty string on error
	 */
	validateFolderExists: function() {
		return (configProp) => {
			if (!configProp)
				return null;
			let message;
			if (configProp.value) {
				const folder = path.resolve(process.cwd(), configProp.value);
				try {
					const stats = fs.lstatSync(folder);
					if (stats.isDirectory())
						return folder;
					configProp.errorInvalid = `${configProp.envName} folder (${folder}) does not exists.`;
				} catch (error) {
					message = error;
				}
			}
			configProp.errorInvalid = `${configProp.envName} folder (${configProp.value}) does not exists.`;
			if (message)
				configProp.errorInvalid += `Exception: ${message}`;
			return null;
		};
	},

	/**
	 * Validates if the value is a correct URL
	 *
	 * @returns the validator function which itself returns - the validate URL or a new URL("https://estos.de") on error
	 */
	validateURL: function() {
		return (configProp) => {
			if (!configProp)
				return null;
			try {
				if (typeof URL === "function")
					return new URL(configProp.value);
				/* istanbul ignore next */
				throw Error("Cannot load URL. Internal error.");
			} catch (error) {
				configProp.errorInvalid = `${configProp.envName} invalid URL (${configProp.value}). Exception: ${error.message}`;
			}
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.Validator to check if environment variable value is compatible with a boolean
	 *
	 * @returns the validator function which itself returns - true or false if the value matched 1 or 0, false if none was matched
	 */
	validateBoolean: function() {
		return (configProp) => {
			if (!configProp)
				return null;
			if (configProp && configProp.value !== undefined) {
				if (configProp.value === "1")
					return true;
				else if (configProp.value === "0")
					return false;
				else if (typeof configProp.value.toLowerCase === "function") {
					const lower = configProp.value.toLowerCase();
					if (lower === "true")
						return true;
					else if (lower === "false")
						return false;
				}
			}

			configProp.errorInvalid = `${configProp.envName} has to be of type "1" (true) or "0" (false), currently is (${configProp.value})`;
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.Validator to check if environment variable value is in the given list
	 *
	 * @param validList - List of valid values of this environment
	 * @param convert - "tolower" to make the string lowercase, "toupper" to make it uppercase
	 * @returns the validator function which itself returns - the config value if it is in the list or and empty string
	 */
	validatePartOfList: function(validList, convert) {
		return (configProp) => {
			if (!configProp || !validList)
				return null;
			/* istanbul ignore next */
			if (convert === "toupper")
				configProp.value = configProp.value.toUpperCase();
			/* istanbul ignore next */
			else if (convert === "tolower")
				configProp.value = configProp.value.toLowerCase();
			if (validList.includes(configProp.value))
				return configProp.value;
			configProp.errorInvalid = `${configProp.envName} has to be of type ${validList.toString()}, currently is (${configProp.value})`;
			return null;
		};
	},

	/**
	 * Validates if the values is a number
	 *
	 * @param min - optional min value
	 * @param max - optional max value
	 * @returns the validator function which itself returns - the number if it matches the range or 0 if it failed to match the range
	 */
	validateInteger: function(min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
		return (configProp) => {
			if (!configProp)
				return null;
			const number = parseInt(configProp.value, 10);
			if (!isNaN(number) && number >= min && number <= max)
				return number;
			configProp.errorInvalid = `${configProp.envName} has to be withing [${min}, ${max}], currently is (${configProp.value})`;
			return null;
		};
	},

	/**
	 * Validates if env value is a valid port number
	 *
	 * @returns the validator function which itself returns - the port number if it matched the range 0 to 65535 or 0 on error
	 */
	validatePort: function() {
		return (configProp) => {
			if (!configProp)
				return null;
			const number = parseInt(configProp.value, 10);
			if (!isNaN(number) && number >= 0 && number <= 65535)
				return number;
			configProp.errorInvalid = `${configProp.envName} has to be withing [0, 65535], currently is (${configProp.value})`;
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.Validator to check if environment value is a valid ipv4 string
	 *
	 * @returns the validator function which itself returns - the ip if it is a valid ipv4 ip or null on error
	 */
	validateIPv4: function() {
		return (configProp) => {
			if (!configProp)
				return null;

			if (isIPV4(configProp.value))
				return configProp.value;

			configProp.errorInvalid = `${configProp.envName} has to be a valid IPv4 address, currently is (${configProp.value})`;
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.Validator to check if environment value is a valid ipv6 string
	 *
	 * @returns the validator function which itself returns - the ip if it is a valid ipv6 ip or null on error
	 */
	validateIPv6: function() {
		return (configProp) => {
			if (!configProp)
				return null;

			if (isIPV6(configProp.value))
				return configProp.value;

			configProp.errorInvalid = `${configProp.envName} has to be a valid IPv6 address, currently is (${configProp.value})`;
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.Validator to check if environment value is a valid ipv6 string
	 *
	 * @returns the validator function which itself returns - the ip if it is a valid ipv6 ip or null on error
	 */
	validateIP: function() {
		return (configProp) => {
			if (!configProp)
				return null;

			if (isIPV4(configProp.value))
				return configProp.value;
			if (isIPV6(configProp.value))
				return configProp.value;

			configProp.errorInvalid = `${configProp.envName} has to be a valid IP address, currently is (${configProp.value})`;
			return null;
		};
	},

	/**
	 * Helper for ConfigTemplate.Validator to check if environment variable value is in the given list
	 *
	 * @param validList - List of valid values of this environment
	 * @param convert - "tolower" to make the string lowercase, "toupper" to make it uppercase
	 * @returns the validator function which itself returns - the string array splitted by the seperator or an empty array
	 */
	validateStringArray: function(separator, convert) {
		return (configProp) => {
			if (!configProp || !separator)
				return null;
			if (configProp.value && typeof (configProp.value.split) === "function") {
				/* istanbul ignore next */
				if (convert === "toupper")
					configProp.value = configProp.value.toUpperCase();
				/* istanbul ignore next */
				else if (convert === "tolower")
					configProp.value = configProp.value.toLowerCase();
				return configProp.value.split(separator);
			}

			configProp.errorInvalid = `${configProp.envName} has to be a ${separator} delimeted string list, currently is (${configProp.value})`;
			return null;
		};
	}
};

module.exports = validators;
