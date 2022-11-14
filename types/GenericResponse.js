const SysApplication = require("../classes/Application");
const makeid = require("../utils/makeid");

module.exports = class GenericResponse {
  /**
   * @type {Number} status;
   */
  status = 200;

  /**
   * @type {String} message;
   */
  message = "ok";

  /**
   * @type {Boolean} error;
   */
  error = false;

  /**
   * @type {Object?} data;
   */
  data;

  /**
   * @type {String?} error_id;
   */
  error_id;

  /**
   * @type {String?} error_id_description;
   */
  error_id_description;

  #default_error_id_description =
    "Use this id to contact with the admin of the server for more information.";

  /**
   * @param {Number} status
   * @param {String} message
   */
  constructor(status, message) {
    this.status = status || 200;
    this.message = message || "ok";
  }

  setData(data) {
    if (!this.data) {
      this.data = new Object();
    }
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        this.data[key] = data[key];
      }
    }
    return this;
  }

  getData() {
    if (!this.data) {
      this.data = new Object();
    }
    return this.data;
  }

  /**
   * @param {Number} status
   * @return {this}
   */
  setStatus(status) {
    this.status = status;
    return this;
  }

  /**
   * @param {String} message
   * @return {this}
   */
  setMessage(message) {
    this.message = message;
    return this;
  }

  /**
   * @param {Number} status
   * @param {String} message
   * @return {this}
   */
  setResponse(status, message) {
    this.status = status;
    this.message = message;
    return this;
  }

  /**
   * @doc enable error response;
   * @return {this}
   */
  setError() {
    this.error = true;
    return this;
  }

  /**
   * @doc disable error response;
   */
  clearError() {
    this.error = false;
  }

  store_error() {
    const id = makeid(23);
    this.write_file_error(id);
    return id;
  }

  validate_status() {
    /**
     * @type {SysApplication} lapp
     * @doc 
     * @if status is not one of the success status (non_error_statuses) 
     * @then make changes 
     * @also status is not one of the know_errors, record the error; 
     */
    const lapp = global["lapp"];

    if (!lapp.non_error_statuses.some((s) => s === this.status)) {
      // ! there is an error;
      if (!lapp.know_errors.some((s) => s === this.status)) {
        this.error = true;
        this.message =
          this.message === "ok" ? "Oups!! Something went wrong" : this.message;
        this.error_id = this.store_error();
        this.error_id_description = this.#default_error_id_description;
      } else {
        this.error = true;
        this.message =
          this.message === "ok" ? "Oups!! Something went wrong" : this.message;
      }
    }
  }

  write_file_error(id) {
    if(pro.mode !== "production") return;
    require("fs").appendFileSync(
      pro.root + "/tmp/logs/RestController.error",
      `\n~~~~~ START ERROR ~~~~~
  ${JSON.stringify(
  {
    id: id,
    name: "Production Error - General Error for unknow status",
    severity: -1,
    description: this.message,
    additional_information: this,
    timestamp: new Date(),
  },
  null,
  2
  )}
  ~~~~~ END ERROR ~~~~~\n\n`);
  };

}


