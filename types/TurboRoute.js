module.exports = class TurboRoute {

  turbo_name = String;
  path = String;
  classmethod = String;
  http_method = String;
  schema_name = String;
  pre_service_classname = String;
  pre_service_methodname = String;
  controller_method = String;
  service_classname = String;
  service_methodname = String;
  schema_classname = String;
  authenticated = false;
  schema = null;
  render_view = null;
  namespace = null;
  layout = "main";
  pre_path;

  actual_pre_service = null;
  actual_service = null;


  constructor (class_api_method_name, classname, namespace, pre_path, authenticated, index, layout)
  {

    this.classname = classname;
    this.namespace = namespace ? namespace.replaceAll("::", "_") : classname;
    this.namespace = this.namespace.toLowerCase();
    this.#prepare_obj_config(class_api_method_name, index)
    this.#validate_service();

    this.classmethod = class_api_method_name;
    this.#setSchema();
    this.pre_path = pre_path;
    this.authenticated = authenticated || false;
    this.layout = layout || "main";

    //console.log(this);


  }

  #validate_service ()
  {
    if(
      !pro.Services[this.pre_service_classname] && this.pre_service_methodname
    ) {
      throw new Error(`Service not found with name ${this.pre_service_classname} `)
    }else {
      this.actual_pre_service = pro.Services[this.pre_service_classname];
    }
    if(this.actual_pre_service) {
      if(typeof this.actual_pre_service[this.pre_service_methodname] !== "function") throw new Error(
        `Service not contain method with name ${this.pre_service_methodname} `
      )
    }
    if(
      !pro.Services[this.service_classname] && this.service_methodname
    ) {
      throw new Error(`Service not found with name ${this.service_classname} `)
    }else {
      this.actual_service = pro.Services[this.service_classname];
    }
    if(this.actual_service) {
      if(typeof this.actual_service[this.service_methodname] !== "function") throw new Error(
        `Service not contain method with name ${this.service_methodname} `
      )
    }
  }

  #prepare_obj_config (string, index)
  {
    const clear_string = string.substring(1, string.length);
    const [ _method, _path, _service_name, _schema_name, _routename] = clear_string.split("---");
    this.http_method = _method === "_" ? "get" : _method;
    this.path = _path ? _path : "/";
    
    if(_service_name && _service_name !== ".") {
      this.#setService(_service_name);
    } else {
      this.service_classname = null;
      this.service_methodname = null;
      this.pre_service_classname = null;
      this.pre_service_methodname = null;
    }
    this.schema_name = _schema_name || ".";

    this.turbo_name = this.#validName(_routename, index)

  }

  #service_set_tool (service_string, where_store) 
  {
    if(where_store !== "pre_" && where_store !== "") throw new Error("where_store can only be pre or empty string");
    if(!service_string || service_string === ".") {
      this[where_store + "service_classname"] = null;
      this[where_store + "service_methodname"] = null;
      return;
    }
    let [serviceclassname, servicemethodname] = service_string.split("#");
    if(servicemethodname) {
      this[where_store + "service_classname"] = serviceclassname;
      this[where_store + "service_methodname"] = servicemethodname === "." ? null : servicemethodname;
    } else {
      this[where_store + "service_classname"] = this.classname;
      this[where_store + "service_methodname"] = serviceclassname === "." ? null : serviceclassname;
    }
  }



  /** @todo bad code will fix it later */
  #setService (service_string)
  {
    if(service_string.split(">").length > 1) {
      const [pre_service, after_service] = service_string.split(">");
      this.#service_set_tool(pre_service, "pre_");
      this.#service_set_tool(after_service, "");
    } else {
      this.pre_service_classname = null;
      this.pre_service_methodname = null;
      this.#service_set_tool(service_string, "");
    }
  }


  #setSchema()
  {
    this.schema_classname = this.classname;
    if(this.schema_name === ".") return;
    if(this.schema_name === "..") {
      this.schema_name = "null";
      this.schema = { query: {}, body: {} }
      return;
    }
    if(this.schema_name.split("#").length > 1) {
      const [schema_classname, schema_objname] = this.schema_name.split("#").map(i => i.trim());
      if(!pro.SchemaList.get(schema_classname)) return;
      this.schema_name = schema_objname;
      this.schema_classname = schema_classname;
      this.schema = pro.SchemaList.get(schema_classname)[schema_objname];
    }else{
      if(!pro.SchemaList.get(this.classname)) return;
      this.schema = pro.SchemaList.get(this.classname)[this.schema_name];
    }
  }

  

  log() 
  {
    return {
      path: this.http_method + "::" + "/" + this.pre_path + this.path,
      classname: this.classname, 
      servicename_method: this.service_classname + "_" + this.service_methodname,
      has_schema: this.schema ? true : false
    }
  }

  getFullpath ()
  {
    if(this.pre_path === "") return this.path;
    return "/" + this.pre_path + this.path;
  }

  getSchemaName ()
  {
    return this.schema_classname + " # " + this.schema_name;
  }



  /**
   * 
   * @param {String?} name 
   * @param {Int} index
   * @doc name is the 4rth parameter on classmethod string.
   * @returns {String} 
   */
  #validName (name, index)
  {
    if(!name) return this.classname.toLowerCase() + "_" + index;
    if(name === ".") return this.classname.toLowerCase() + "_" + index;
    return name;
  }

}