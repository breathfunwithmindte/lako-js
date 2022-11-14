const Lako = require("./core/Lako");
const test = require("./services/test");


async function main (application_path)
{
  global["lk"] = new Lako();
  await lk.start(application_path);
}

module.exports = { Lako, main, test }