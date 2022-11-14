const fs = require("fs");
const MpError = require("../types/MpError");
const readdir = fs.readdirSync;

/**
 * @param {String} root
 * @doc - checking for the basic folder structure 
 *        (application, services, tmp and application/Application.js, application/Application.yml)
 * @throw {MpError} error
 * @returns 0
 */
module.exports = (root) => {
  const files = readdir(root);
  let error = false;
  let message = "Missing "

  if(!files.some(s => s === "application")) {
    error = true;
    message = message + 
    "application folder, in the root level of your project. \n \n" +
    "Solution, create an application folder in the root of your project. " + 
    "Also keep in mind that this folder should contain 2 important files <Application.js and Application.yml> \n" +
    "Notice:: Application js is a Class that extends pro.SysApplication class. \n"
  }

  if(!files.some(s => s === "services")) {
    error = true;
    message = message + 
    "services folder, in the root level of your project. \n \n" +
    "Solution, create an services folder in the root of your project. " 
  }

  if(!files.some(s => s === "tmp")) {
    error = true;
    message = message + 
    "tmp folder, in the root level of your project. \n \n" +
    "Solution, create an tmp folder in the root of your project. " + 
    "Also keep in mind that this folder should contain 2 files for your docs < doc_res.template.json and doc.template.json > and logs folder. \n"
  }

  /** dive deeper */
  if(error === false) {
    const app_dir_files = readdir(root + "/application");
    // const database_dir_files = readdir(root + "/database")
    const logs_dir_files = readdir(root + "/tmp")

    if(!app_dir_files.some(s => (s === "application.yml" && "Application.js"))) {
      error = true;
      message = message + "application/application.yml || application/Application.js, inside the application folder."
    }

    if(!logs_dir_files.some(s => s === "logs")) {
      error = true;
      message = message + "tmp/logs."
    }

  }
  
  if(error) throw new MpError(-1, message);
  return 0;
}