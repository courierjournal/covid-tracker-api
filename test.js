const fs = require('fs');

let test = (shouldifail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("test resolved");
    }, 500);
    if (shouldifail) {
      reject("test errored out");
    }
  });
};

(async () => {
  let asyncResultsResolve = await test();
  console.log(`Async Results are: ${asyncResultsResolve}`);

  let asyncResultsReject = null;
  try {
    let asyncResultsReject = await test(true);
  } catch (err) {
    asyncResultsReject = err;
  }
  console.log(`Async Results are: ${asyncResultsReject}`);
})();

console.log(global['fs']);