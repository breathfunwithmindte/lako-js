const fs = require("fs");

module.exports = class Generator {

  /**
   * @param
   */
  static generate_controller (controllers_path, controller_name, controller_methods)
  {
    if(!controllers_path || !controller_name || !controller_methods) throw new Error("Controller path, name and method are required.");

    

  }

}