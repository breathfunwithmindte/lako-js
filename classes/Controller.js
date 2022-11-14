const TurboRoute = require("../types/TurboRoute");
const classapimethods = require("../utils/classmethodapis");

module.exports = class Controller {
  static use_pre_path;
  static pre_path;
  static middlewares = [];
  static api_methods;
  static restapi = false;
  static namespace = null;

  static init() {
    const { pre_path, middlewares, router, authenticated, layout } = this;
    const pre_api_path = this.restapi === false ? "" : `api/v1/`;
    this.use_pre_path =
      typeof pre_path === "string"
        ? `${pre_api_path}${pre_path}`
        : `${pre_api_path}${this.name.toLowerCase()}`;
    this.user_router = router;
    this.api_methods = classapimethods(this);
    this.use_middlewares = middlewares
      ? middlewares
          .map((m) => {
            if (pro.Middlewares[m]) {
              return pro.Middlewares[m];
            } else {
              pro.logs.logc(31, `Middleware not found with name ${m}`);
            }
          })
          .filter((f) => typeof f === "function")
      : [];
    this.turbo_routes = new Array();
    this.api_methods.map((i, index) =>
      this.turbo_routes.push(
        new TurboRoute(i, this.name, this.namespace, this.use_pre_path, this.authenticated, index, layout)
      )
    );
    // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1", this.turbo_routes, classapimethods)
  }

  constructor() {}

  /** @interface - you can override this default behaviour of a controller; */
  error_handler_rest (error, req, res, turbo_route) { res.status(500).json({ message: "Something went wrong" }) }

  /** @interface - you can override this default behaviour of a controller; */
  error_handler_view (error, req, res, turbo_route) { res.send("<h1>Something went wrong || 500</h1>") }

  async run_service (turbo_route, req, res) {
    if(turbo_route.actual_service) {
      await turbo_route.actual_service[turbo_route.service_methodname](req.$service_props || {
        queries: { ...req.query, ...req.params }, formstate: req.body, req, res, populate: req.$populate || undefined
      }, res.$gresponse);
    }
  }

  async run_preservice (turbo_route, req, res) {
    if(turbo_route.actual_pre_service) {
      await turbo_route.actual_pre_service[turbo_route.pre_service_methodname](req.$service_props || {
        queries: { ...req.query, ...req.params }, formstate: req.body, req, res, populate: req.$populate || undefined
      }, res.$gresponse);
    }
  }

  on_validation_error (req, gresponse) {
    gresponse.setErrors(req.$validator_errors);
    gresponse.setInfo({
      path: req.route.path,
      method: req.method,
      queries: req.query,
      body: req.body,
    });
    throw gresponse;
  }


  log_dev(req, res, turbo_route, err) {
    const fs = require("fs");
    if (pro.mode === "development") {
      try {
        const writable_obj = {
          name: "Rest Controller Info",
          $main: err ? err : res.$gresponse,
          $validator_error: req.$validator_error,
          $validator_errors: req.$validator_errors,
          $cookies: req.$cookies,
          $queries: req.$queries,
          $params: req.$params,
          $body: req.$body,
          $turbo_route: turbo_route,
          $service_props: req.$service_props,
          $error: req.$error,
          $view: req.$view,
          createdAt: new Date(),
          timestamp1: new Date().toLocaleDateString(),
          timestamp2: new Date().toLocaleTimeString()
        };
        fs.writeFileSync(
          pro.root + "/tmp/logs/RestController.info.json",
          `${JSON.stringify(writable_obj, null, 2)}`
        );
        const currdata = new Date().toLocaleDateString();
        const currdatetime = new Date().toLocaleTimeString();
        const filename =
          currdata.replaceAll("/", "_") +
          " " +
          currdatetime.replaceAll(":", "_").replaceAll(".", "");
        if (fs.existsSync(pro.root + "/tmp/logs/DELETEME_restinfo")) {
          fs.writeFileSync(
            pro.root + `/tmp/logs/DELETEME_restinfo/${filename}.info.json`,
            `${JSON.stringify(writable_obj, null, 2)}`
          );
        } else {
          fs.mkdirSync(pro.root + "/tmp/logs/DELETEME_restinfo");
          fs.writeFileSync(
            pro.root + `/tmp/logs/DELETEME_restinfo/${filename}.info.json`,
            `${JSON.stringify(writable_obj, null, 2)}`
          );
        }
      } catch (e) {
        console.log(e);
        console.log(e.toString());
      }
    }
  }
};
