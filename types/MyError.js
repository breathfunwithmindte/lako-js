const SysApplication = require("../classes/Application");
const makeid = require("../utils/makeid");
const MpError = require("./MpError");

module.exports = class MyError extends MpError {
  /**
   * @param {Number<1, 0, -1, -2>} severity - enum< 0, 1, -1, -2 > 0=warning, 1=just error, -1, -2 important errors and recored;
   * @param {String} description description for error recording;
   * @param {*} additional_information aditional information for error recording, send also as response for development mode;
   * @param {BigInteger} status status send as a response || if it is rest api, this status is actual http status;
   * @param {String} message message send as a response;
   */
  constructor(
    severity,
    description = "Something went wrong",
    additional_information = {},
    status = 500,
    message = "none"
  ) {
    super(severity, description);
    this.additional_information = additional_information;
    this.mode = pro.mode;
    this.status = status;
    this.message = message;
  }

  get_severity() {
    if (this.severity === -1) return "CRITICAL";
    if (this.severity === -2) return "FATAL";
    if (this.severity === 0) return "WARNING";
    if (this.severity === 1) return "GENERAL ERROR";
  }

  /**
   * @return {Object}
   */
  response() {
    if (this.mode === "development") {
      return {
        status: this.status,
        message: `Message = ${this.message} <==> Description = ${this.description}`,
        additional_information: this.additional_information,
      };
    }

    if (this.mode === "production" || this.mode === "testing") {
      const id = makeid(23);
      let errormessage = "Oups Something went wrong.";
      if (this.severity === -1 || this.severity === -2) {
        this.write_file_error(id);
        errormessage = "Oups Something went wrong. For more information cantact to admin with error id = " + id;
      }
      const returnObject = {
        status: this.status,
        message:
          this.message === "none"
            ? errormessage
            : this.message + " For more information cantact to admin with error id = " + id,
      }
      if(this.mode === "testing") return { ...returnObject, mode: this.mode }
      return returnObject;
    }
    return {
      status: this.status,
      message: "something went wrong - fatal unknow error",
    };
  }

  write_file_error(id) {
    require("fs").appendFileSync(
      pro.root + "/tmp/logs/RestController.error",
      `\n~~~~~ START ERROR ~~~~~
${JSON.stringify(
  {
    id: id,
    name: "Production Error - MyError",
    severity: this.severity,
    description: this.description,
    additional_information: this.additional_information,
    timestamp: this.timestamp,
  },
  null,
  2
)}
~~~~~ END ERROR ~~~~~\n\n`
    );
  }
};
