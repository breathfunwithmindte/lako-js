var cluster = require("cluster");
const fs = require("fs");
const project_structure_check = require("../services/project_structure_check");
const logs = require("../utils/logs");
const Project = require("./Project");
const LServer = require("./Server");
const SysApplication = require("../classes/Application");
const MpError = require("../types/MpError");

module.exports = class Lako {
  constructor() {}

  async build_project() {
    try {
      this.primary_configurations();

      /**
       * @type {SysApplication} app
       */
      const app = global["lapp"];

      if(cluster.isMaster) {
        app.health_check();
      }else {
        app.logs = false;
        app.log_table_primary_routes = false;
      }

      /**
       * @type {LServer} server
       */
      const server = global["lServer"];

      app.pre_server(server.app);

      app.init();
      app.connect_db_v1();
      app.registerServices();
      app.registerSchemas();
      app.registerMiddlewares();
      app.registerControllers();
      app.registerViews();
      app.registerTestControllers();
      /**
       * @doc creating new Express.Router for each router in the application config ... the initial is used as prefix for each path;
       */
      app.routers.map((r) => {
        server.addRouter(r.name, r.initial);
      });

      /**
       * @doc // ! here is the actual where each controller-router is registered to the express;
       */
      pro.Controllers.forEach((ControllerClass, key) => {

        //  this line getting which router will be used. If controller no specify any router, it will use the default router
        // with index 0 from app routers. Currently not something special ... but exist just in case
        const current_router_name = server.getRouter(ControllerClass.router) ? ControllerClass.router: app.routers[0].name;

        // each controller can contain multiple turboroutes.... looop for each one to register it in express server;
        for (let index = 0;index < ControllerClass.turbo_routes.length;index++) 
        {
          server.addRoute(current_router_name, ControllerClass.turbo_routes[index], ControllerClass.use_middlewares);
        }
      });

      if (app.enable_docs) {
        lServer.build_doc();
      }

      if (app.log_table_primary_routes) {
        let routes = [];
        server.routers.forEach((v) => v.routes.map((r) => routes.push(r)));
        console.table(routes);
      }
      
      app.after_server(server.app);

      if(app.clusters === 1) {
        server.listen();
      }else {
        if (cluster.isMaster) {
          for (var i = 0; i < app.clusters; i++) {
            cluster.fork();
          }
        } else {
          server.listen();
        }
      }
      if(cluster.isMaster) {
        console.log(`\x1b[${35} Server is running in ${app.clusters} ${  app.clusters === 1 ? "cluster" : "clusters"}.`,"\x1b[0m");
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`\x1b[${35} Approximately memory usage is ${Math.round(used * 100) / 100} MB.`, "\x1b[0m" );
      }
    } catch (e) {
      console.log(e, "\n");
      logs.logc(31, "Error message " + e.toString());
    }
  }

  /**
   * todo reset the project in runtime;
   */
  async reset_project(root) {
    // ? check for the basic project structure without database or dive deeper in folders.
    global["lServer"].server.close();
    const structure_check = project_structure_check(root);
    await this.build_project();
  }

  // creating new project - new app instanses --- health check of the application --- db connection and more;
  primary_configurations(include_server) {
    // ? this contain almost all information for the project as well as many system classes.
    const project = new Project();

    global["pro"] = project; // ? assign project as pro to the global object;
    global["root"] = require("path").resolve(); // ? assing the root of the project to the global object;
    pro.root = root; // ? assing root of the project to the pro object;

    // ? application class is the system config for the project;
    const AppClass = require(root + "/application/Application.js"); //? new application class

    /**
     * @type {SysApplication} app
     */
    const app = new AppClass();
    // ? set initial configs from .yml file or .env file
    app.setApplicationProperties();

    global["lapp"] = app; // ? assign app as lapp to the global object;

    if (include_server === false) return;
    const lServer = new LServer();
    global["lServer"] = lServer; // ? assign server as lServer to the global object;
  }

  async start(root) {
    try {
      // ? check for the basic project structure without database or dive deeper in folders.
      const structure_check = project_structure_check(root);

      await this.build_project();
    } catch (err) {
      if (err instanceof MpError) {
        err.log();
      } else {
        console.log(err);
        console.log(err.toString());
      }
    }
  }
};
