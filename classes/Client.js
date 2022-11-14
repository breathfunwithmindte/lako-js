const http = require("http");

module.exports = class Client {

  /**
   * @typedef {Object} Options
   * @property {string} method
   * @property {Object<string, string>} headers
   * @param {string} path 
   * @param {Options} options 
   * @returns 
   */
  static request (path, options)
  {
    return new Promise((rs, rj) => {
      let req = http.request({
        method: "PUT",
        hostname: "localhost",
        port: 5000,
        path: "/api/v1/article/update/asdasdasd",
        headers: {
            "Content-Type": "application/json"
        }
      }, function (res) {
        const chunks = [];
        res.on("data", (e) => {
          chunks.push(e);
        })
        res.on("end", (e) => {
            const body = Buffer.concat(chunks);
            res["raw_body"] = body.toString();
            if(res.headers["content-type"].search("application/json") !== -1) {
              res["body"] = JSON.parse(body.toString());
            }
            rs(res);
        })
      })
      req.end();
    })
  }

}