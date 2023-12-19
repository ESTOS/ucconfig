import { URL } from "url";

export type Environment = "development" | "staging" | "production";
export type LogLevels = "error" | "warn" | "info" | "debug";

export interface ICoreConfig {
	// [ENV_PREFIX]_VERSION_BUILD_DATE
	versionBuildDate: Date;
	// [ENV_PREFIX]_VERSION_TAG
	versionTag: string;
	// [ENV_PREFIX]_ENVIRONMENT
	environment: Environment;
	// [ENV_PREFIX]_LOG_LEVEL
	logLevel: LogLevels;
	// [ENV_PREFIX]_LOG_TO_CONSOLE
	logToConsole: boolean;
	// [ENV_PREFIX]_DEVELOPMENT
	development: boolean;
}

/**
 * EConfigProperty
 * Class represents a config property
 */
export declare class EConfigProperty {
	public envName: string;
	public isRequired: boolean;
	public value: string | undefined;
	public defaultValue: string | undefined;
	public errorMissing: boolean;
	public errorInvalid: string | undefined;
}

/**
 * In case a property is required or optional for a certain environment we can handle that with the EConfigPropertyOptional object
 *
 * If a parameter is optional for a certain environment set this property to true,
 * For the ones where it is specified false the config handler will enforce the existance and report an error
 * The default constructor classifies
 */
export declare class EConfigPropertyOptional {
	public constructor(development: boolean, staging: boolean, production: boolean);
	// Optional in local development | mandatory in production
	// eslint-disable-next-line no-use-before-define
	public static local_development: EConfigPropertyOptional;
	// Optional in production | mandatory in local development
	// eslint-disable-next-line no-use-before-define
	public static production: EConfigPropertyOptional;
}

/**
 * EConfigTemplate
 * Represents a config item
 */
export declare class EConfigTemplate {
	/**
	 * Creates the EConfigTemplate class
	 *
	 * @param envPrefix - a prefix which is used to search for variables in the env. The prefix is added with following _
	 * @param env - A custom env container which might be usefull if we don´t use process.env (which is the default if nothing has been specified)
	 */
	protected constructor(envPrefix?: string, env?: { [id: string]: string });
	protected coreConfig: ICoreConfig;
	protected initCore(): void;

	/**
	 * Creates a new Config property.
	 * Reads the env (including the prefix) from the env and validates the content with the validator
	 * Result of the operation must be validate with the validate method in the end
	 * If the property is not part of the environment and a defaultValue value has been specified this value is used
	 * If the validator fails to validate the value the result value will be null
	 *
	 * @param envName - Name of the environment property to load
	 * @param validator - The validator that checks the content of the value
	 * @param defaultValue - An optional default value which is used when the property is not in the environment
	 * If the defaultValue is not specified and the variable is not in the env the result will be undefined
	 * the helper class EConfigPropertyOptional allows to set the value as optionally undefined per environment
	 * @returns the validated T type or null on a validation error
	 */
	protected newProperty<T>(envName: string, validator: (configProps: EConfigProperty) => T, defaultValue?: T | EConfigPropertyOptional): T;

	/**
	 * Creates a new Config property.
	 * Reads the env (including the prefix) from the env, replaces ${VARIABLES} with environment properties
	 * and validates the content with the validator
	 * Result of the operation must be validate with the validate method in the end
	 * If the property is not part of the environment and a defaultValue value has been specified this value is used
	 * If the validator fails to validate the value the result value will be null
	 *
	 * @param envName - Name of the environment property to load
	 * @param validator - The validator that checks the content of the value
	 * @param defaultValue - An optional default value which is used when the property is not in the environment
	 * If the defaultValue is not specified and the variable is not in the env the result will be undefined
	 * the helper class EConfigPropertyOptional allows to set the value as optionally undefined per environment
	 * @param must - The environment variables e.g. ${VARIABLES} must be replaced, if it is not replaced the method reports an error
	 * @returns the validated T type or null on a validation error
	 */
	protected newEnvProperty<T>(envName: string, validator: (configProps: EConfigProperty) => T, defaultValue?: T | EConfigPropertyOptional, must?: boolean): T;

	public validate(exitOnError?: boolean): null | { invalidPropertyValues: string[], missingProperties: string[] };
}

interface IValidators {
	validateFileExists: () => ((configProp: EConfigProperty) => string);
	validateFolderExists: () => ((configProp: EConfigProperty) => string);
	validateURL: () => ((configProp: EConfigProperty) => URL);
	validateBoolean: () => ((configProp: EConfigProperty) => boolean);
	validatePartOfList: (validList: string[], convert?: "tolower" | "toupper") => ((configProp: EConfigProperty) => string);
	validateInteger: (min?: number, max?: number) => ((configProp: EConfigProperty) => number);
	validatePort: () => ((configProp: EConfigProperty) => number);
	validateIPv4: () => ((configProp: EConfigProperty) => string);
	validateIPv6: () => ((configProp: EConfigProperty) => string);
	validateIP: () => ((configProp: EConfigProperty) => string);
	validateString: (convert?: "tolower" | "toupper") => ((configProp: EConfigProperty) => string);
	validateStringNotEmpty: (convert?: "tolower" | "toupper") => ((configProp: EConfigProperty) => string);
	validateStringArray: (separator: string, convert?: "tolower" | "toupper") => ((configProp: EConfigProperty) => string[]);
}

export const validators: IValidators;
