const Validator = require("../utils/validator");
const TurboRoute = require("../types/TurboRoute");
const ejs = require("ejs");
const GeneralResponse = require("../types/GeneralResponse");
const MyError = require("../types/MyError");

/**
 * @primary middleware that checking the request current schema, and pass data to the validator ... (if error and send response happens inside the controller not here);
 * @param {Request} req 
 * @param {Response} res 
 * @param {import("express").NextFunction} next 
 * @param {TurboRoute} turbo_route 
 * @doc the first thing that happens on each request, is to set the default data to the Request req instance;
 * ! serius performance issues ... this logic should be rebuild somehow ...
 * @todo // todo split this initial setup to 2 different middlewares ... remove unused parts for each controller for better performance;
 * @returns 
 */
exports["primary_middleware"] = function (req, res, next, turbo_route) {
  
  res.$gresponse = new GeneralResponse(req.method ? (req.method.toLowerCase() === "post" ? 201 : 200) : 200); // General Response;

  req.$savefilesync = savefilesync;
  
  req.$cookies = getCookies(req.headers["cookie"])
  if(!turbo_route.schema)
  {
    next();
    return;
  }
  req.$validator_errors = new Array(); // only if there is a schema we need this array;

  if(turbo_route.schema.view) { res.$view = turbo_route.schema.view; }
  if(turbo_route.schema.views) { req.$views = turbo_route.schema.views; }

  if (turbo_route.schema.query) {

    const result_queries = Validator(turbo_route.schema.query, req.query, "queries");
    if(result_queries.errors.length > 0) {
      req.$validator_error = true;
      result_queries.errors.map(i => req.$validator_errors.push(i));
    }
    req.query = result_queries.data;

  } else {
    req.query = req.query;
  }

  if (turbo_route.schema.body) {

    const result_body = Validator(turbo_route.schema.body, req.body || {}, "body");
    if(result_body.errors.length > 0) {
      req.$validator_error = true;
      result_body.errors.map(i => req.$validator_errors.push(i));
    }
    req.body = result_body.data;

  } else {
    req.body = req.body;
  }

  next();

}



/**
 * @param {String | undefined} cookie_string;
 */
function getCookies (cookie_string)
{
  if(!cookie_string) return new Object();
  const cookies = new Object();
  const key_value_pairs = cookie_string.split(";").map(i => i.trim());
  key_value_pairs.map(p => {
    const [k, v] = p.split("=").map(i => i.trim());
    cookies[k] = v || "";
  })
  return cookies;
}

function savefilesync (file, body, key) {
  try {
    require("fs").writeFileSync(`${pro.root}/storage/${file.name}`, file.data);
    body[key || "file"] = file.name;
    return 0;
  } catch (err) {
    console.log(err);
    console.log("make sure you have a folder /storage in your root directory.")
    return -1;
  }
}

