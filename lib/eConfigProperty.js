
/**
 * EProperty represents a variable
 */
class EConfigProperty {
	constructor(envName, defaultValue) {
		// Environment name used to fetch from env variables
		this.envName = envName;
		// If no defaultValue has been specified the value must come from the environment
		this.isRequired = arguments.length < 2;
		// if isrequired = false the defaultValue defines the value thats been used if no value was found in the environment
		this.defaultValue = defaultValue;
		// value contains the what is beeing found in the environment
		if ({}.hasOwnProperty.call(process.env, this.envName)) {
			this.value = process.env[this.envName];
			this.errorMissing = false;
		} else {
			this.value = undefined;
			this.errorMissing = true;
		}
		this.errorInvalid = undefined;
	}
}

module.exports = EConfigProperty;
