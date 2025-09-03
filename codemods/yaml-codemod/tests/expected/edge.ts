// input: replace console.debug and ignore other console methods
console.debug("debugging", { a: 1 });
console.info("info", 2);
console.error("error");

function doStuff() {
  logger.log("inside");
}


