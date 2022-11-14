const Controller = require("./Controller");
const Validator = require("../utils/validator");
const { service_runner } = require("../services/ServiceRunner");
const GeneralResponse = require("../types/GeneralResponse");
const MyError = require("../types/MyError");
const TurboRoute = require("../types/TurboRoute");
const { logwarn } = require("../utils/logs");

module.exports = class RestController extends Controller {
  static restapi = true;
  static response_type = "application/json";
  controller_type = "rest"

  /**
   * @override
   * @doc - controller error handler
   * @param {*} error - Enum(GeneralResponse | MyError | Any)
   * @param {Object} req - http request instance
   * @param {Object} res - http response instance 
   * @param {TurboRoute} turbo_route 
   * @returns 
   */
  error_handler_rest (error, req, res, turbo_route)
  {
    if(error instanceof GeneralResponse) {
      error.validate();
      if(pro.mode === "development") { logwarn("[ERR] 'GeneralResponse' - status=" + error.status); console.log(error) }
      res.status(error.status).json(error);
      this.log_dev(req, res, turbo_route, null)
      return;
    }

    if(error instanceof MyError) {
      if(pro.mode === "development") { logwarn("[ERR] 'MyError' - status=" + error.status) }
      // ! here on production if severirty is -1 or -2 error will be recorded;
      this.log_dev(req, res, turbo_route, error);
      res.status(error.status).json(error.response());
      return;
    }

    // ? try to avoid this kind of errors;
    if(pro.mode === "development") { logwarn("[ERR] 'unknown' - msg=" + error?.toString()) }
    const myerror = new MyError(-1, error?.toString(), turbo_route, 500);
    res.status(500).json(myerror.response());
  
  }

  /**
   *
   * @param {*} express
   * @param {TurboRoute} turbo_route
   * @returns
   */
  async run(express, turbo_route) {
    const { req, res } = express;
    /** @type {GeneralResponse} */
    const gresponse = res.$gresponse;

    try {
      // ? unsure why this exist ... will implement something later;
      if (res.$error) {throw gresponse;}

      if (req.$validator_error && req.$validator_errors instanceof Array === true) this.on_validation_error(req, gresponse);

      await this.run_preservice(turbo_route, req, res);

      const result = await this[turbo_route.classmethod](
        express,
        { files: req.files, queries: req.query, body: req.body, params: req.params, cookies: req.$cookies, user: req.user },
        gresponse, turbo_route 
      );

      if (result === null || result === false) return;
      if (typeof result === "string") { res.send(result); return; }
      if (typeof result === "object") gresponse.setData(result);
      if (result === undefined) await this.run_service(turbo_route, req, res);

      this.log_dev(req, res, turbo_route, null);
      gresponse.validate();
      res.status(gresponse.status || 500).json(gresponse);
    } catch (error) {
      this.error_handler_rest(error, req, res, turbo_route);
    }
  }
};
