const array = [];
const object = {};
const n = 5000000;


let startTime = 0;
let passedTime = 0;

function resetTimer() {
  startTime = Date.now();
}
function updatePassedTime() {
  passedTime = Date.now() - startTime;
}

resetTimer();
for (let i = 0; i < n; i++) {
  const x = i.toString();
  object[x] = x;
}
updatePassedTime();
console.log('obj done!', object);
console.log('passed time:', passedTime);

resetTimer();
for (let i = 0; i < n; i++) {
  const x = i.toString();
  array.push(x);
}
updatePassedTime();
console.log('array done!', array);
console.log('passed time:', passedTime);

let target = '2500000';
let x = ' ';

resetTimer();
// Find value
x = array.find(value => value === target );
updatePassedTime();
console.log('found value in array', x);
console.log('passed time:', passedTime);

resetTimer();
// Find value
x = object[target];
updatePassedTime();
console.log('found value in object', x);
console.log('passed time:', passedTime);
