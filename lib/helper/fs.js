
let fs = null;

/**
 * Fakes lstatSync returns
 * isFile funtion which returns always false
 *
 * @param {string} _: ignored parameter just to math method signature
 * @returns always false
 */
const lstatSync = function(_) {
	return {
		isFile: () => false
	};
};

try {
	// eslint-disable-next-line no-eval
	fs = eval("require(\"fs\")");
} catch (error) {
	fs = {
		lstatSync
	};
}

module.exports = fs;
