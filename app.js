let { flatten } = require("./js/flatten");
let fs = require("fs");
let d = JSON.parse(fs.readFileSync("/tmp/pictures.json"));
d = flatten(d);
fs.writeFileSync("/tmp/picturesout.json", JSON.stringify(d, null, 2));
return;