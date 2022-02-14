
// function logTime(func) {
//   function wrappedFunction() {
//     let startTime = Date.now();
//     const result = func();
//     let endTime = Date.now();
//     console.log("execution time:", endTime - startTime);
//     // return result;
//   }
//   return wrappedFunction;
// }

// @logTime
// function doSomeWork() {
//   for (let i = 0; i < 1000000000; i++) {};
// }

// doSomeWork();





// function log(Class) {
//   return (...args) => {
//     console.log(args);
//     return new Class(...args);
//   };
// }

// @log
// class Example {
//   constructor(name, age) {
//   }
// }

// const e = new Example('Graham', 34);
// // [ 'Graham', 34 ]
// console.log(e);
// // Example {}



// @annotation
// class MyClass {}

// function annotation(target) {
//   target.annotated = true;
// }