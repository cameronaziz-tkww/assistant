import isPromise from './isPromise';

const resolve = <T>(value: T): T | Promise<T> => (isPromise(value) ? value : Promise.resolve(value));

export default resolve;
