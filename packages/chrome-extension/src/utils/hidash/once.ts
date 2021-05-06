import before from "./before";

function once<T extends (...args: App.ShouldDefineType) => App.ShouldDefineType>(fn: T): T {
	return before(2, fn);
}

export default once;