const TestSector = require("./TestSector");
const Logs = require("../utils/logs");
const Client = require("../classes/Client");

/**
 * 1 test -> multiple sectors (describe)
 * 1 sector -> multiple mini tests
 * 
 */

module.exports = class MpTest {

  /** @type {Map<String, Function>} */
  sectors = new Map()

  /** @type {Array<TestSector>} */
  final = new Array();

  /** @type {Boolean} pass */
  pass = true;

  /**
   * @param {String} title 
   * @param {Function} callback(string, string)
   */
  describe (title, callback) {
    this.sectors.set(title, callback);
  }

  async execute () {
    const arr_sectors = Array.from(this.sectors);

    for (let tindex = 0; tindex < arr_sectors.length; tindex++) {
      const [key, callback] = arr_sectors[tindex];
      //

      const test = new TestSector(key);
      await callback(test, Client);
      if(!test.passed) { this.pass = false; }
      this.final.push(test);

    }

  }

}
