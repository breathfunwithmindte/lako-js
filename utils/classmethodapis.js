const logs = require("./logs");

function getClassMethods(className) {
  if (className instanceof Object === false) {
    logs.logferr("[ERROR] => parameter is not class.")
    throw new Error("[ERROR] => parameter is not class." + className)
  }
  let ret = new Set();

  function methods(obj) {
    if (obj) {
      let ps = Object.getOwnPropertyNames(obj);
      ps.forEach((p) => {
        if (
          [
            "__proto__",
            "__defineGetter__",
            "__defineSetter__",
            "__lookupGetter__",
            "__lookupSetter__",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "toString", "valueOf", "toLocaleString"
          ].some(s => s === p)
        ) return;
          if (obj[p] instanceof Function && p.startsWith("~")) {
            ret.add(p);
          } else {
            // console.log("@@@", p);
            //can add properties if needed
          }
      });

      methods(Object.getPrototypeOf(obj));
    }
  }

  methods(className.prototype);

  return Array.from(ret);
}

module.exports = getClassMethods;