
// interface Callback {
//   (...args: any[]): void
// }
// interface FunctionWithCallback {
//   (...args: [any[], Callback]): void
// }

// function promisify<T extends FunctionWithCallback>(f: T) {
//   return function (...args: App.NoTail<Parameters<T>>): Promise<Parameters<App.Tail<Parameters<T>>>> {
//     return new Promise((resolve) => {
//       const callback = (...results: Parameters<App.Tail<Parameters<T>>>) => { // our custom callback for f
//         resolve(results);
//       };

//       f(...args, callback);
//     });
//   };
// }

// export default promisify;
