/**
 * Looks at a string for specified 'needle' and return the number after it
 * @param(string) - The string we're looking through
 * @param(string) - The full 'needle' we need to find the text
 * @return(number)
 */
module.exports = (str, needle) => {
  let re = new RegExp(`${needle}(\\d+)`);
  let matches = str.match(re);

  if (matches.length > 0) {
    return parseInt(matches[1]);
  }
};
