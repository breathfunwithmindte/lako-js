module.exports = class MpError {
  /**
   * @type {number} severity Enum (1, 0, -1, -2)
   */
   severity;

  /**
   * @type {string} description
   */
  description;

  /**
   * @type {Date} timestamp
   */
  timestamp;

  /**
   * @param {number} severity  Enum (1, 0, -1, -2)
   * @param {string} description 
   */
  constructor (severity, description) {
    this.severity = severity;
    this.description = description;
    this.timestamp = new Date();
  }

  toString () {
    return `Severity ${this.severity}, Message = ${this.description}. \n ${this.timestamp}`
  }

  log () {
    const logs = require("../utils/logs");
    const msg = `<MpError> ${this.description} \n ${this.timestamp}`;
    if(this.severity === -2) {
      logs.logferr(msg)
    } else if (this.severity === -1) {
      logs.logerr(msg)
    }
  }


};
