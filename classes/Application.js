const logs = require("../utils/logs");
const reader = require("../utils/reader");
const fs = require("fs");
const Y = require("yaml");
const MpError = require("../types/MpError");
const ApplicationProperties = require("../config/app.json");

module.exports = class SysApplication {

   /**
   * @typedef {Object} RouterConfig
   * @property {String} name
   * @property {String} initial
   */

  /** @type {String} controller_path */
  controller_path;
  /** @type {String} middleware_path */
  middleware_path;
  /** @type {String} schema_path */
  schema_path;
  /** @type {String} doc_path */
  doc_path;
  /** @type {String} authentication_middleware */
  authentication_middleware;
  /** @type {String} authentication_middleware_isadmin */
  authentication_middleware_isadmin;
  /** @type {String} doc_middleware */
  doc_middleware;
  /** @type {String} test_controller_path */
  test_controller_path;
  /** @type {String} view_engine */
  view_engine;
  /** @type {String} mode */
  mode;
  /** @type {Boolean} logs */
  logs;
  /** @type {Boolean} enable_database */
  enable_database
  /** @type {Boolean} controller_path */
  enable_docs;
  /** @type {Boolean} log_table_primary_routes */
  log_table_primary_routes;
  /** @type {Boolean} enable_cors */
  enable_cors;
  /** @type {Boolean} rewrite_doc */
  rewrite_doc;
  /** @type {Boolean} use_views */
  use_views;
  /** @type {RouterConfig[]} routers */
  routers;
  /** @type {Number[]} know_errors */
  know_errors;
  /** @type {Number[]} non_error_statuses */
  non_error_statuses;

  /** @type {String} dbtype */
  dbtype;
  /** @type {String} mgdburl */
  mgdburl;
  /** @type {Number} clusters */
  clusters;

  constructor() {
    
  }

  setApplicationProperties ()
  {
    let app_config = Y.parse(
      fs.readFileSync(root + "/application/application.yml", "utf-8")
    );
    pro.set_env_variables();
    app_config = { ...app_config, ...pro.env };
    ApplicationProperties.required_application_properties.map(property => {
      if(this[property.name] !== undefined) return;
      if(typeof app_config[property.name] !== property.type && property.default === "none") {
        throw new Error(
          `Application.yml file OR Application.js constructor OR .env file should contain as ${property.type} 
          the following property ${property.name}`
        );
      } else {
        if(app_config[property.name] === undefined) {
          this[property.name] = property.type === "string" ? `${property.initial}${property.default}` : property.default;
        } else {
          this[property.name] = property.type === "string" ? `${property.initial}${app_config[property.name]}` : app_config[property.name]
        }
      }
    })
    pro.mode =
    ["production", "development", "testing"].some(s => s === this["mode"]) ? this.mode : "development";
  }

  /**
   * returns {void}
   */
  health_check() {
    const results = [];
    if (
      !this.controller_path ||
      !fs.existsSync(root + `/${this.controller_path}`)
    ) {
      results.push(
        new MpError(
          -2,
          "Not found controller's folder. Lako Framework cannot work without controllers directory."
        )
      );
    }
    if (this.enable_database && !fs.existsSync(root + "/database")) {
      results.push(
        new MpError(-2, "Not found database folder in your root directory.")
      );
    }
    if (
      this.enable_database &&
      !fs.existsSync(root + "/database/database.yml")
    ) {
      results.push(
        new MpError(
          -2,
          "Not found database.yml file. You cannot use database without database configuration file."
        )
      );
    }
    if (this.enable_database && !fs.existsSync(root + `/database/models`)) {
      results.push(
        new MpError(
          -2,
          "Not found models's folder. You cannot use database without models directory."
        )
      );
    }
    if (!this.schema_path || !fs.existsSync(root + `/${this.schema_path}`)) {
      results.push(
        new MpError(
          -1,
          `Not found schemas's folder. We recommend to use schemas for your apis.
      This is worth for auto creating documetations and also validate the incoming data to your server.
      Notice that some functionalities of the app can not work as expected.`
        )
      );
    }
    if (
      !this.middleware_path ||
      !fs.existsSync(root + `/${this.middleware_path}`)
    ) {
      results.push(
        new MpError(
          -1,
          `Not found middlewares's folder. Some functionalities might not work as expected.`
        )
      );
    }
    if (results.length === 0)
      return logs.logpass("Health check of application was ok.");

    logs.perflog(
      results.map((i) => [i.severity, i.description + `\n[${i.timestamp}]`])
    );
    if (results.some((s) => s.status === -2))
      throw new Error(
        "Health check was not completed successfully. There are fatal errors."
      );
  }

  /**
   * @param {object} env enviroment variables;
   * @interface - used to be ovewritten by the application.js on the client;
   */
  init(env) {}

  /**
   * @doc - register each file from /services directory.
   * @doc - depends on if service start-with __ put them as property to project or to project.services;
   * @returns {void}
   */
  registerServices() {
    try {
      const files = reader(root + "/services", (i) => {
        if (!i.startsWith(".")) return true;
      });
      pro.setServices(files);
      if (this.logs === true) {
        logs.logpass("Services are set successfully.");
      }
    } catch (e) {
      console.log(e);
      logs.logerr(
        "Error happened while trying to register services. Error tostring = " +
          e.toString()
      );
    }
  }

  /**
   * @doc - register each file from /services directory.
   * @doc - depends on if service start-with __ put them as property to project or to project.services;
   * @returns {void}
   */
  registerViews() {
    try {
      const layouts = fs.readdirSync(root + this.view_path + "/layouts");
      const files = reader(root + this.view_path + "/pages", (i) => {
        if (!i.startsWith(".") && !i.startsWith("_")) return true;
      });
      pro.setViews(
        layouts.map((l) => {
          return {
            filename: l,
            fulldir: root + this.view_path + "/layouts/" + l,
          };
        }),
        files.map((n) => {
          const filedir = n.fulldir.split(this.view_path + "/pages/")[1]
          if(!filedir) return console.log("bug should do somthing here, filestystem missing dir of file [views]");
          const namespace_pre = filedir.split("/" + n.filename)[0];
          if(n.filename === namespace_pre) return {...n, namespace: ""};
          return {...n, namespace: namespace_pre.replaceAll("/", "_")};
        })
      );
      if (this.logs === true) {
        logs.logpass("Views are set successfully.");
      }
    } catch (e) {
      console.log(e);
      logs.logerr(
        "Error happened while trying to register services. Error tostring = " +
          e.toString()
      );
    }
  }

  /**
   * @doc - register each file from /application/schema directory.
   * @doc - depends on if service start-with __ put them as property to project or to project.services;
   * @returns {void}
   */
  registerSchemas() {
    try {
      if (!this.schema_path) return;
      const files = reader(root + this.schema_path, (i) => {
        if (!i.startsWith(".")) return true;
      });
      pro.setSchemaList(files);
      if (this.logs) {
        logs.logpass("Schemas are set successfully.");
      }
    } catch (e) {
      console.log(e);
      logs.logerr(
        "Error happened while trying to register schemas. Error tostring = " +
          e.toString()
      );
    }
  }

  registerMiddlewares() {
    try {
      if (!this.middleware_path) return;
      const files = reader(root + this.middleware_path, (i) => {
        if (!i.startsWith(".")) return true;
      });
      pro.setMiddlewares(files);
      if (this.logs) {
        logs.logpass("Middlewares are set successfully.");
      }
    } catch (e) {
      console.log(e);
      logs.logerr(
        "Error happened while trying to register schemas. Error tostring = " +
          e.toString()
      );
    }
  }

  registerControllers() {
    try {
      const files = reader(root + this.controller_path, (i) => {
        if (!i.startsWith(".")) return true;
      });
      pro.setControllers(files);
      if (this.logs) {
        logs.logpass("Controllers are set successfully.");
      }
    } catch (e) {
      console.log(e);
      logs.logerr(
        "Error happened while trying to register controllers. Error tostring = " +
          e.toString()
      );
    }
  }
  registerTestControllers () {
    try {
      if(pro.mode !== "testing") return;
      const files = reader(root + this.test_controller_path, (i) => {
        if (!i.startsWith(".")) return true;
      });
      pro.setTestControllers(files);
      if (this.logs) {
        logs.logpass("Test Controllers are set successfully.");
      }
    } catch (e) {
      console.log(e);
      logs.logerr(
        "Error happened while trying to register controllers. Error tostring = " +
          e.toString()
      );
    }
  }

  connect_db_v1() {
    try {
      if (!this.enable_database) return;

      let db_config_yml = Y.parse(
        fs.readFileSync(root + "/database/database.yml", "utf-8")
      );
      const db_config = { ...db_config_yml, ...pro.env }
      ;["TESTING__MGDBURL", "DEVELOPMENT__MGDBURL", "PRODUCTION__MGDBURL"].map(key => {
        if(db_config[key]) { db_config[key.toLowerCase()] = db_config[key] }
      })
     
      if(!db_config["testing__mgdburl"] || !db_config["development__mgdburl"] || !db_config["production__mgdburl"]) throw new Error(`
        All keys development__mgdburl, production__mgdburl, testing__mgdburl are required. You can use the same url for 1 or more of these keys.
      `);

      if(pro.mode === "testing") { this.mgdburl = db_config["testing__mgdburl"]}
      if(pro.mode === "production") { this.mgdburl = db_config["production__mgdburl"]}
      if(pro.mode === "development") { this.mgdburl = db_config["development__mgdburl"]}

      const mongoose = require("mongoose");
      global["$conn"] = mongoose.createConnection(this.mgdburl);
      pro.db_connected = true;
      pro.mgdburl = this.mgdburl;

      const files = reader(root + "/database/models", (i) => {
        if (!i.startsWith(".")) return true;
      });
      files.map((f) => {
        const modelschema = require(f.fulldir);
        const modelname_mongo =
          f.filename.substring(0, f.filename.length - 3).toLowerCase() + "s";
        const modelname = f.filename.substring(0, f.filename.length - 3);
        const curr_model = $conn.model(modelname_mongo, modelschema);
        pro.Models[modelname] = curr_model;
      });
      if (this.logs) {
        logs.logpass("Connected to database " + pro.mgdburl);
        logs.logpass("Models set succesfully");
      }
    } catch (e) {
      logs.logerr(
        "Error happened while trying to register models. Error tostring = " +
          e.toString()
      );
    }
  }


  async catch_error () {

  }


  rest_err(err, req) {
    if (pro.mode === "production") {
      return {
        error: true,
        total_error: 1,
        errors: [
          {
            namespace: "rest",
            description: "Something went wrong",
          },
        ],
        path: req.route.path,
        method: req.method,
        queries: req.$queries,
        body: req.$body,
      };
    } else {
      console.log(err);
      pro.logs.logerr(err.toString());
      return {
        error: true,
        total_error: 1,
        errors: [{ namespace: "rest", description: err.toString() }],
        path: req.route.path,
        method: req.method,
        queries: req.$queries,
        body: req.$body,
      };
    }
  }
};
