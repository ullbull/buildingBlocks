function logTime(func) {
  function wrappedFunction() {
    let startTime = Date.now();
    const result = func();
    let endTime = Date.now();
    console.log("execution time:", endTime - startTime);
    // return result;
  }
  return wrappedFunction;
}

@logTime
function doSomeWork() {
  for (let i = 0; i < 1000000000; i++) {};
}

setTimeout(function () {
  console.log("yey!")
  doSomeWork();
}, 1000);