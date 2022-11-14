const SysApplication = require("../classes/Application");
const SysRestController = require("../classes/RestController");
const SysViewController = require("../classes/ViewController");
const TestController = require("../classes/TestController");
const SysService = require("../classes/Service");
const Y = require("yaml");

const validator = require("../utils/validator");
const logs = require("../utils/logs");
const fs = require("fs");
const makeid = require("../utils/makeid");


module.exports = class Project {
  SysApplication = SysApplication;
  RestController = SysRestController;
  ViewController = SysViewController;
  SysService = SysService;
  SysTestController = TestController;

  /**
   * @doc <string, class>
   */
  Services = new Object();

  /**
   * @doc <string, class>
   */
  Controllers = new Map();

  /**
   * @doc <string, class instance>
   */
  ControllersInstances = new Map();

  /**
   * @doc <string, object<query, body>>
   */
  SchemaList = new Map();

  /**
   * @doc <string, class instance mongoose Model>
   */
  Models = new Object();

  /**
   * @doc <string, class instance Route>
   */
  Routes = new Map();

  /**
   * @doc <string, function> 
   */
  Middlewares = new Object();

  /**
   * @doc <string, function> 
   * @type {Map<string, string>}
   */
  Layouts = new Map();

  /**
   * @doc <string, function> 
   * @type {Map<string, string>}
   */
  Views = new Map();

  /**
   * @doc - 
   * @type {Map<string, TestController>}
   */
  TestControllers = new Map()

  /**
   * @doc {*} config obj from .env file in the root of the project 
   */
  env = new Object();

  /**
   * @doc logs tools
   */
  logs = logs

  /**
   * @type {String[]} classnames;
   */
  classnames = new Array();

  /**
   * @doc {*} list 
   */
  db_connected = false;

  /**
   * @doc {string} mode enum of production | development
   */
  mode = String;

  /**
   * @doc validator function
   */
  validator = validator

  /**
   * @doc tmp docs array
   */
  docs_per_route = new Array();

  /**
   * @doc initials for each api router
   */
   initials_routers_paths = new Map();

  dbname = String;
  dburl = String;
  root = String;
  random (min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }

  makeid (prop) {
    return makeid(prop)
  }

  setServices (list)
  {
    const sys_list = list.filter( f => f.filename.startsWith("__"));
    sys_list.map(i => {
      const current_class = require(i.fulldir);
      this[current_class.name.split("Service")[0]] = current_class;
    })
    const non_sys_list = list.filter( f => !f.filename.startsWith("__"));
    non_sys_list.map(i => {
      const current_class = require(i.fulldir);
      this["Services"][current_class.name.split("Service")[0]] = current_class;
    })

  }

  setViews (layouts, pages)
  {
    layouts.map(i => this.Layouts.set(i.filename.split(".")[0], fs.readFileSync(i.fulldir, "utf-8")));
    pages.map(i => {
      if(i.namespace.startsWith("system")) {
        this.Views.set(i.filename.split(".")[0], fs.readFileSync(i.fulldir, "utf-8"))
      }
      else if(i.namespace !== "") {
        this.Views.set(i.namespace + "_" + i.filename.split(".")[0], fs.readFileSync(i.fulldir, "utf-8"))
      } else {
        this.Views.set(i.filename.split(".")[0], fs.readFileSync(i.fulldir, "utf-8"))
      }
    });
  }

  setSchemaList (list)
  {
    list.map(i => this.SchemaList.set(i.filename.substring(0, i.filename.length - 3), require(i.fulldir)));
  }

  setMiddlewares (list)
  {
    list.map(i => this.Middlewares[i.filename.substring(0, i.filename.length - 3)] = require(i.fulldir));
  }

  setTestControllers (list)
  {
    list.map(i => {
      // do smthing //
      const curr_class = require(i.fulldir);
      const classname = i.filename.split(".")[0];
      const curr_instance = new curr_class();
      if(curr_instance instanceof TestController === false) {
        logs.logerr(
          `Error happened while trying to register test controllers. Test controller should be type of pro.SysTestController. Controller dir = ${i.fulldir} `
        );
        return;
      }
      curr_instance.init();
      this.TestControllers.set(classname, curr_instance);
    })
  }

  setControllers (list)
  {
    const docs = [];
    list.map(i => {
      try {
        const ControllerClass = require(i.fulldir);
        // ! debug console.log(ControllerClass) // undestand what is doing init method
        ControllerClass.init();
        // ! debug console.log(ControllerClass) // undestand what is doing init method
  
        pro.Controllers.set(ControllerClass.name, ControllerClass);
        const ControllerInstance = new ControllerClass();

        if(this.classnames.some(s => s === ControllerClass.name)) throw new Error("Controller already exist with that classname");
        this.classnames.push(ControllerClass.name);
  
        // instance will have the middlewares functions //
        pro.ControllersInstances.set(ControllerClass.name, ControllerInstance);

      } catch (e) {
        console.log(e);
        logs.logerr(`Error happened while trying to register controller with name ${i.fulldir}. Error tostring = ${e.toString()} `);
      }
    })

    
    // preparing docs and setting them into global variable project //
    pro.Controllers.forEach((v, k) => {
      if(!v.turbo_routes[0]) return logs.logwarn("there is an controller with 0 routes.")
      const classname = v.turbo_routes[0].classname;
      // !debug console.log(v.turbo_routes[0]);
      docs.push({
        classname: classname,
        authenticated: v.doc_authenticated === true ? true : false, //
        onlyadmin: v.doc_onlyadmin === true ? true : false,
        description: v.doc_description || "", 
        routes: v.turbo_routes.map(turbo_route => {
          const curr_schema = pro.SchemaList[turbo_route.classname]
          return { path: turbo_route.getFullpath(), schema: turbo_route.schema || null, classname: turbo_route.classname }
        })
      })
    })

    //require("fs").writeFileSync(root + "/application/schema/__doc.json", JSON.stringify(docs, null, 2))
    //require("fs").writeFileSync(root + "/application/schema/__doc.yaml", Y.stringify(docs))
    
  }

  registerInitials ()
  {
    this.app.initials_paths.map(i => {
      this.initials_routers_paths.set(i.name, i.initial);
    });
  }

  set_env_variables ()
  {
    if(fs.existsSync(this.root + "/.env")) {
      const env_string = fs.readFileSync(this.root + "/.env").toString();
      env_string.split(/\r?\n/).filter(f => f !== "").map(i => {
        const [key, value] = i.split("=")
        if(value && value.trim().startsWith("arr:")) {
          this.env[key.trim()] = value.trim().substr(4, value.length).split(",").map(i => i.trim());
        }else if(!isNaN(Number(value))) {
          this.env[key.trim()] = Number(value);
        } else {
          this.env[key.trim()] = typeof value === "string" ? value.trim() : null;
        }
      })
    }else {
      this.logs.logc(31, "Missing .env file.");
    }
  }


  log_important ()
  {
    console.log({
      important: {Controllers: this.Controllers,
        ControllersInstances: this.ControllersInstances,
        Models: this.Models,
        Routes: this.Routes,
        Middlewares: this.Middlewares,
        docs: JSON.stringify(this.Docs),
        Services: this.Services}
    })
  }

}