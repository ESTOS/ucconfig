module.exports = {
	ignorePatterns: [
		"node_modules"
	],
	root: true,
	extends: [
		"standard",
		"eslint:recommended",
		"plugin:promise/recommended",
		"plugin:import/recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/recommended"
	],
	parser: "@typescript-eslint/parser",
	plugins: [
		"@typescript-eslint",
		"jsdoc",
		"eslint-plugin-tsdoc",
		"jest"
	],
	parserOptions: {
		ecmaVersion: 2018
	},
	rules: {
		"no-tabs": "off",
		indent: [
			"error",
			"tab", {
				SwitchCase: 1
			}
		],
		semi: [
			"error",
			"always"
		],
		quotes: [
			"error",
			"double",
			{
				allowTemplateLiterals: true
			}
		],
		"space-before-function-paren": [
			"error",
			{
				anonymous: "never",
				named: "never",
				asyncArrow: "always"
			}
		],
		camelcase: "off",
		curly: [
			"error",
			"multi-or-nest"
		],
		"nonblock-statement-body-position": [
			"error",
			"below"
		],
		"no-unneeded-ternary": "off",
		"no-var": "error",
		"prefer-const": "error",
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": "off",
		"promise/always-return": "off",
		"promise/no-callback-in-promise": "off",
		"promise/no-promise-in-callback": "off",
		"import/no-unresolved": "off",
		"@typescript-eslint/camelcase": "off",
		"@typescript-eslint/naming-convention": [
			"error",
			{
				selector: "interface",
				format: ["PascalCase"],
				prefix: ["I"]
			}
		],
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/class-name-casing": "off",
		"@typescript-eslint/no-empty-function": "off",
		"require-jsdoc": [
			"error",
			{
				require: {
					FunctionDeclaration: true,
					MethodDefinition: false,
					ClassDeclaration: true,
					ArrowFunctionExpression: false,
					FunctionExpression: false
				}
			}
		]
	},
	overrides: [
		{
			files: [
				"*.js"
			],
			rules: {
				"@typescript-eslint/explicit-function-return-type": "off",
				"@typescript-eslint/no-var-requires": "off",
				"eslinttsdoc/syntax": "off",
				tsdoc: "off",
				"@typescript-eslint/interface-name-prefix": "off"
			}
		}
	],
	env: {
		jest: true,
		jasmine: true
	}
};
