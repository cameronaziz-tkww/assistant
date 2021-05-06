// // @ts-nocheck

// const canUseSymbol = typeof Symbol === 'function' && Symbol.for;
// const REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

// interface PossibleReactElement {
//   $$typeof?: typeof REACT_ELEMENT_TYPE;
// }

// const isMergeableObject = <T>(value: T): boolean => isNonNullObject(value) && !isSpecial(value);

// const isNonNullObject = <T>(value: T): boolean => !!value && typeof value === 'object';

// const isSpecial = <T>(value: T): boolean => {
// 	var stringValue = Object.prototype.toString.call(value)
// 	return stringValue === '[object RegExp]'
// 		|| stringValue === '[object Date]'
// 		|| isReactElement(value)
// };

// const isReactElement = <T extends PossibleReactElement>(value: T): boolean => value.$$typeof === REACT_ELEMENT_TYPE;

// const emptyTarget = <T>(value: T) => Array.isArray(value) ? [] : {};

// const cloneUnlessOtherwiseSpecified = <T>(value: T, options: Hidash.Options): T =>
//   (options.clone !== false && options.isMergeableObject && options.isMergeableObject(value))
// 		? deepmerge(emptyTarget(value), value, options) as T
// 		: value

// const defaultArrayMerge = <T, U>(target: T[], source: U[], options: Hidash.Options): (T & U)[] => {
// 	return target.concat(source as unknown as T).map(function(element) {
// 		return cloneUnlessOtherwiseSpecified(element, options)
// 	}) as (T & U)[]
// };

// const uniqueArrays = <T, U>(target: T[], source: U[]): (T & U)[] => {
// 	const final = new Set<T | U>();
// 	for (const element of target) {
// 		if (!final.has(element)) {
// 			final.add(element);
// 		}
// 	}
// 	for (const element of source) {
// 		if (!final.has(element)) {
// 			final.add(element);
// 		}
// 	}
// 	return [...final] as (T & U)[];
// }

// const uniqueArrayMerge = <T, U>(target: T[], source: U[], options: Hidash.Options): (T & U)[] => {
// 	if (
// 		((target.length > 0 && typeof target[0] !== 'object')
// 		|| (source.length > 0 && typeof source[0] !== 'object'))
// 		&& options.uniqueArrays
// 	) {
// 		return uniqueArrays(target, source);
// 	}
// 	return defaultArrayMerge(target, source, options);
// }

// function getMergeFunction(key, options) {
// 	if (!options.customMerge) {
// 		return deepmerge
// 	}
// 	var customMerge = options.customMerge(key)
// 	return typeof customMerge === 'function' ? customMerge : deepmerge
// }

// const getEnumerableOwnPropertySymbols = <T extends object>(target: T) =>{
// 	return Object.getOwnPropertySymbols
// 		? Object.getOwnPropertySymbols(target)
//       .filter((symbol) =>
//         target.propertyIsEnumerable(symbol),
//       ) as unknown as string[]
// 		: []
// }

// const getKeys = <T extends object>(target: T): (keyof T)[] =>{
//   const keys = getEnumerableOwnPropertySymbols(target);
// 	return Object.keys(target).concat(keys) as (keyof T)[];
// }

// const propertyIsOnObject = <T extends object>(object: T, property: keyof T) => {
// 	try {
// 		return property in object
// 	} catch(_) {
// 		return false
// 	}
// }

// // Protects from prototype poisoning and unexpected merging up the prototype chain.
// function propertyIsUnsafe(target, key) {
// 	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
// 		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
// 			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
// }

// const mergeObject = <T, U>(target: Partial<T>, source: Partial<U>, options: Hidash.OptionsWithClone<T & U>): T & U => {
// 	var destination = {} as T & U;
// 	if (options.isMergeableObject(target)) {
// 		getKeys(target).forEach((key) => {
// 			const value = cloneUnlessOtherwiseSpecified(target[key], options)
// 			destination[key] = value;
// 		})
// 	}
// 	getKeys(source).forEach((key) => {
// 		if (propertyIsUnsafe(target, key)) {
// 			return
// 		}

// 		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
// 			destination[key] = getMergeFunction(key, options)(target[key], source[key], options)
// 		} else {
// 			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options)
// 		}
// 	})
// 	return destination
// }

// // function deepmerge<T>(x: Partial<T>, y: Partial<T>, options?: Hidash.Options): T;
// // function deepmerge<T1, T2>(x: Partial<T1>, y: Partial<T2>, options?: Hidash.Options): T1 & T2;
// function deepmerge<T, U>(target: Partial<T>, source: Partial<U>, options?: Hidash.Options): T & U {
// 	const baseOptions = options as Hidash.OptionsWithClone<T & U> || {} as Hidash.OptionsWithClone<T & U>
// 	const arrayMerge = options?.uniqueArrays ? uniqueArrayMerge : defaultArrayMerge;
// 	baseOptions.arrayMerge = options?.arrayMerge || arrayMerge;
// 	baseOptions.isMergeableObject = options?.isMergeableObject || isMergeableObject
// 	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
// 	// implementations can use it. The caller may not replace it.
// 	baseOptions.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified

// 	const sourceIsArray = Array.isArray(source)
// 	const targetIsArray = Array.isArray(target)
// 	const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

// 	if (!sourceAndTargetTypesMatch) {
// 		return cloneUnlessOtherwiseSpecified(source, baseOptions) as T & U;
// 	} else if (Array.isArray(source) && Array.isArray(target)) {
// 		return baseOptions.arrayMerge(target, source, baseOptions) as unknown as T & U;
// 	}
// 	return mergeObject(target, source, baseOptions);
// };

// export default deepmerge;
