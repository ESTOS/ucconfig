/**
 * Fakes resolve fron "path"
 * Implementation details
 * https://nodejs.org/api/path.html#pathresolvepaths
 * resolve which confuntion which returns always false
 *_
 * @param {string[]}: ...paths <string> A sequence of paths or path segments
 * @returns concatinated string
 */
const resolve = function(...path) {
	// Get rid of invalid arguments
	if (path == null || (path.length === 1 && path[0] == null))
		throw new TypeError(`Invalid value "${path}" given.`);

	let resolveString = "";
	if (typeof path === "string")
		return path;
	if (typeof path !== "object")
		throw new TypeError("Invalid parameter given");

	for (let idx = 0; idx < path.length; idx++) {
		let pathItem = path[idx];
		if (pathItem == null)
			continue;
		pathItem = pathItem.replaceAll("\\", "/");

		const lastItem = pathItem.charAt(pathItem.length - 1);

		// Falls letztes item wird kein / benoetigt
		if (idx === path.length - 1)
			resolveString += pathItem;
		else {
			if (lastItem === "/")
				resolveString += pathItem;
			else
				resolveString += pathItem + "/";
		}
	}

	return resolveString;
};

let path;

try {
	// eslint-disable-next-line no-eval
	path = eval("require(\"path\")");
	path._test = { resolve };
} catch (error) {
	path = {
		resolve
	};
}

module.exports = path;
