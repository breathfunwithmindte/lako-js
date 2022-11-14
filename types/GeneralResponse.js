const GenericResponse = require("./GenericResponse");
const ValidationError = require("./ValidationError");

module.exports = class GeneralResponse extends GenericResponse {
  /**
   * @type {ValidationError[]} errors;
   */
  errors = new Array();

  /**
   * @type {Number} total_errors;
   */
  total_errors = 0;

  /**
   * @type {Object?} info
   */
  info;

  /** @type {String | null} view; */
  #view = null;
  /** @type {String | null} layout; */
  #layout = "devmain";


  /**
   * @param {Number} status
   * @param {String} message
   * @param {ValidationError[]} errors
   */
  constructor(status = 200, message = "ok", errors = [], info) {
    super(status, message, errors.length !== 0);

    if (errors.length > 0) {
      this.errors = errors;
      this.total_errors = errors.length;
    }

    if (info) {
      this.setInfo(info);
    }
  }

  /**
   * @param {Object?} info
   */
  setInfo(info) {
    for (const key in info) {
      if (Object.hasOwnProperty.call(info, key)) {
        this[key] = info[key];
      }
    }
    return this;
  }

  /**
   * @param {ValidationError} error
   * @param {Number?} status
   * @param {String?} message
   */
  addError(error, status, message) {
    if (this.errors.length === 0) {
      this.errors.push(error);
      this.#default_enable_error(status, message);
    } else {
      this.errors.push(error);
    }
    return this;
  }
  /**
   * @param {ValidationError[]} errors
   * @param {Number?} status
   * @param {String?} message
   * @return {this}
   */
  setErrors(errors, status, message) {
    if(errors instanceof Array === false) return;
    this.errors = errors;
    this.#default_enable_error(status, message);
    return this;
  }

  validate () {
    this.validate_status();
    if(this.errors && this.errors.length === 0) {
      delete this.total_errors;
      delete this.errors;
    }
  }

  /**
   * @param {Number?} status
   * @param {String?} message
   */
  #default_enable_error(status = 400, message = "Oups!! Bad Request format.") {
    this.error = true;
    this.status = status;
    this.message = message;
    if(this.errors.length > 0) { this.total_errors = this.errors.length }
  }


  setLayout (layout_string) {
    if(typeof layout_string !== "string") return this;
    this.#layout = layout_string;
    return this;
  }
  getLayout() { return this.#layout }

  setView (view_string) {
    if(typeof view_string !== "string") return this;
    this.#view = view_string;
    return this;
  }
  getView() { return this.#view }

  
};

