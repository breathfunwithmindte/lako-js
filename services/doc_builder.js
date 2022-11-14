const fs = require("fs");

module.exports = (turbo_route, name, initial, middlewares, fullpath, response_type) => {
  const doc_parameters = [];
  let doc_body = null;
  let doc_responses = new Object();

  const curr_schema = turbo_route.schema || {};
  const curr_method = turbo_route.http_method.toLowerCase();
  const curr_path = fullpath.split("/").map(i=> { if(i.startsWith(":")) { return `{${i.substring(1, i.length)}}` } else{ return i } }).join("/");

  const curr_parameters = [];

  if(curr_schema["body"]) {
    doc_body = {
      "description": curr_schema["body_description"] || "request body",
      "required": true,
      "content": { "application/json": { "schema": { "type": "object", "properties": {} } } }
    }
    for (const keyb in curr_schema["body"]) {
      if (Object.hasOwnProperty.call(curr_schema["body"], keyb)) {
        doc_body["content"]["application/json"]["schema"]["properties"][keyb] = curr_schema["body"][keyb];
      }
    }
  }

  const default_html_response = {"200": { description: "Html Page",content: { "text/html": {} } }}

  if(curr_schema["responses"]) {
    if(response_type === "text/html") {
      doc_responses = default_html_response
    } else {
      console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", curr_path)
      doc_responses = curr_schema["responses"];
    }
  } else {
    if(response_type === "text/html") {
      doc_responses = default_html_response
    } else {
      doc_responses = JSON.parse(fs.readFileSync(root + "/tmp/doc_res.template.json", "utf-8"));
    }
  }

  if(curr_schema["query"]) {
    for (const key1 in curr_schema["query"]) {
      if (Object.hasOwnProperty.call(curr_schema["query"], key1)) {
        doc_parameters.push({
          in: "query",
          type: curr_schema["query"][key1]["type"],
          name: key1,
          required: curr_schema["query"][key1]["required"]
        })
      }
    }
  }

  if(curr_schema["params"]) {
    if(curr_schema["params"] instanceof Array === true) {
      curr_schema["params"].map(i => {
        doc_parameters.push({
          in: "path", type: "string", name: i, required: true
        })
      })
    }
  }
  
  
  pro.docs_per_route.push({
    routername: `#${name}`,
    curr_path: curr_path,
    [curr_path]: {
      [curr_method]: {
        tags: [turbo_route.classname],
        description: curr_schema.description,
        summary: curr_schema.summary,
        operationID: turbo_route.classname,
        parameters: doc_parameters,
        requestBody: doc_body,
        responses: doc_responses
      }
    },
    
  })
}