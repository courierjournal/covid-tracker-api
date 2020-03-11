/**
 * Parse a csv string into an array of objects
 * @param(string) csv - string of newline seperated rows
 */
module.exports = csv => {
  let csvRows = csv.split("\n").filter(n => n !== "");
  let headers = csvRows.shift();
  headers = headers.split(",").map(n => n.trim());
  let output = [];
  csvRows.forEach(n => {
    let outputRow = {};
    let row = n.split(",").map((r, i) => {
      if (r.charAt(0) === '"' && r.charAt(r.length - 1) === '"') {
        r = r.substring(1, r.length - 1);
        r = r.replace(/""/g, '"');
      }
      outputRow[headers[i]] = r;
    });
    output.push(outputRow);
  });
  return output;
};
