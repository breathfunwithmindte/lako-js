const http = require("http");
const doc_builder = require("../services/doc_builder");
const TurboRoute = require("../types/TurboRoute");
const fs = require("fs");
const Y = require("yaml");
var cluster = require("cluster");

/**
 * todo the part with the docs in most messy part of the project. This sould be complete be rewritten.
 */

module.exports = class LServer {
  #express = require("express");
  #middlewares = require("../services/Middlewares");

  constructor ()
  {
    this.app = this.#express();
    this.server = http.createServer(this.app);
    this.routers = new Map();
    if(lapp.enable_cors) {
      this.app.use((r, rs, next) => {
        rs.header('Access-Control-Allow-Origin','*');
        rs.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        rs.header('Access-Control-Allow-Credentials', true);
        rs.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH');
        next();
      })
    }

    this.useSetDefault();
  }

  listen()
  {
    this.server.listen(pro.env['PORT'] || 5000, () => {
      if(cluster.isMaster) {
        console.log(`Server is listening at port ${pro.env['PORT'] || 5000}`)
      }
    });
  }


  useSetDefault ()
  {
    // * your can change these default uses from here directly updating the LakoJS Framework module.
    this.app.use(this.#express.json());
    this.app.use(require("express-fileupload")());
    this.app.use("/public", require("express").static(require("path").resolve() + "/public"))
  }

  /**
   * @param  {string} name
   * @param  {string} initial
   */
  addRouter (name, initial)
  {
    const newrouter = this.#express.Router();
    this.app.use(initial || "", newrouter);
    this.routers.set(name, { router: newrouter, routes: [], initial: initial });
  }

  /**
   * @param {string} name 
   */
  deleteRouter (name)
  {
    this.routers.delete(name);
  }

  /**
   * @param {string} name 
   * @returns 
   */
  getRouter (name) 
  {
    return this.routers.get(name);
  }

  /**
   * @param {string} name 
   * @param {TurboRoute} turbo_route 
   * @param {function[]} middlewares 
   * @returns 
   */
  addRoute (name, turbo_route, middlewares=[])
  {
    if(!this.routers.has(name)) return console.log("Router instance not found. name = " + name);
    const { router, routes, initial } = this.routers.get(name);
    if(!pro.ControllersInstances.has(turbo_route.classname)) return console.log("Current instance not found. path = " + turbo_route.getFullpath());
    const current_controller = pro.ControllersInstances.get(turbo_route.classname);
    const current_controller_class = pro.Controllers.get(turbo_route.classname);

    router[turbo_route.http_method.toLowerCase()] (turbo_route.getFullpath(), 
      
      (req, res, next) => this.#middlewares.primary_middleware(req, res, next, turbo_route), /** ? middleware validate queries and body */

      (req, res, next) => {if(pro.mode === "development"){
        //console.log(JSON.stringify(turbo_route));
        //pro.logs.logc(35, `classname => ${turbo_route.classname} path => ${turbo_route.path + "\t classmethod =>\t" + turbo_route.classmethod}`)
      };
        next()
      }, /** log some info only for dev mode */

      middlewares.map(middleware => { return async (req, res, next) => { await middleware(req, res, next, turbo_route)} }), // register dynamic middlewares //
      (req, res) => current_controller.run({ req, res }, turbo_route) // run primary controller //
    );

    const fullpath = initial + turbo_route.getFullpath();
    const response_type = current_controller_class.response_type;

    routes.push({ 
      namespaces: `#${name}::${turbo_route.classname}::${turbo_route.turbo_name}`,
      http: "[" + turbo_route.http_method.toUpperCase() + "] " + fullpath, 
      services: `${
        turbo_route.pre_service_classname}#${turbo_route.pre_service_methodname || "none"
      } < ${turbo_route.service_classname}#${turbo_route.service_methodname || "none"}`,
      schema: turbo_route.schema ? turbo_route.getSchemaName() : "none",
      res: response_type.split("/")[1]
    })

    doc_builder(turbo_route, name, initial, middlewares, fullpath, response_type);

  }


  build_doc () {
    try {
      if(lapp.rewrite_doc === true) {
        let doc_template_json = fs.readFileSync(`${root}/tmp/doc.template.json`, "utf-8");
        let path_obj = new Object();
        pro.docs_per_route.map(i => { 
          if(path_obj[i["curr_path"]]) {
            for (const key in i[i["curr_path"]]) {
              if (Object.hasOwnProperty.call(i[i["curr_path"]], key)) { path_obj[i["curr_path"]][key] = i[i["curr_path"]][key] }
            }
          } else {
            path_obj[i["curr_path"]] = i[i["curr_path"]]
          }
        })

        doc_template_json = doc_template_json.replace(`"%%dynamic-docs%%"`, JSON.stringify(path_obj, null, 2));
        let doc_template_yml = Y.stringify(JSON.parse(doc_template_json));

        // todo next versions to make optional what type of file will be used for docs;
        fs.writeFileSync(`${root}/tmp/doc.running.json`, doc_template_json);
        fs.writeFileSync(`${root}/tmp/doc.running.yml`, doc_template_yml);

        const doc_router = this.routers.get("doc");
    
        doc_router.router.use(require('swagger-ui-express').serve, require('swagger-ui-express').setup(JSON.parse(doc_template_json)));

      }
      //console.log(pro.docs_per_route);
      delete pro.docs_per_route;
    } catch (err) {
      console.log("ERROR happened while trying to set docs.")
    }
  }

  addRoutes (name, routes)
  {

  }

  /**
   * @param  {Array<object>} list_routes
   * @param  {string} router_name
   * @returns {undefined | number} -1 error | 0 not found | undefined ok
   */
  registerRouterRoutes (list_routes, router_name)
  {
    if(!this.routers.has(router_name)) return 0;
    
    const current_router = this.routers.get()
  }

  loop_turbo_routes ()
  {

  }


}