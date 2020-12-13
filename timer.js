let startTime = 0;

function resetTimer() {
  startTime = Date.now();
}

function getPassedTime() {
  return Date.now() - startTime;
}


// const n = 500;

// resetTimer();
// for (let i = 0; i < n; i++) {
//   console.log('apa')
// }
// console.log(`This tok ${getPassedTime()} milliseconds.`);


module.exports = {
  resetTimer,
  getPassedTime
}