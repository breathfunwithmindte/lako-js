const ValidationError = require("../types/ValidationError");

module.exports = (schema, data, name) => {

  /**
   * @type {ValidationError[]} errors
   */
  const errors = new Array();
  const newobject = new Object();

  for (const key in schema) {
    if (Object.hasOwnProperty.call(schema, key)) {

      if(schema[key].isarray) {

        const current_arr_value = data[key];
        if(current_arr_value instanceof Array === false) {
          errors.push({ namespace: name, field: key, error: true, descriptions: ["Value should be a list."] })
        }else {
          const local_arr = [];
          const arr_descriptions = [];

          current_arr_value.map((current_v, ind) => {
            const { final_value, err_descriptions } = validate_field (key, current_v, schema[key]);
            if(err_descriptions.length > 0) {
              arr_descriptions.push({ index: ind, descriptions: err_descriptions });
            }else {
              local_arr.push(final_value);
              newobject[key] = final_value;
            }
          })
          if(arr_descriptions.length > 0) {
            errors.push({ namespace: name, field: key, error: true, descriptions: arr_descriptions })
          }else {
            newobject[key] = local_arr;
          }
        }

      }else {
        let current_value = data[key];
        if((current_value === undefined || current_value === null) && (schema[key].default !== undefined)) {
          current_value = schema[key].default
        }
        const { final_value, err_descriptions } = validate_field (key, current_value, schema[key]);
  
        if(err_descriptions.length > 0) {
          const v = new ValidationError(name, key, err_descriptions);
          errors.push(v.toObject());
        }else {
          newobject[key] = final_value;
        }

      }
      
    }
  }
  return { data: newobject, errors };
}


function validate_field (fieldname, value, props)
{
  const err_descriptions = [];
  let final_value = value;
  const { 
    required, 
    type, 
    isarray, 
    minlength, 
    maxlength, 
    oneof, 
    notoneof,
    startwith,
    notstartwith,
    endwith, 
    notendwith,
    contain, 
    notcontain, 
    greater, 
    lighter,
    regex,
    not_allowed_regex  
  } = props

  switch (type) {
    case "string":
      if(required && ( typeof value !== "string" )) {
        err_descriptions.push(`Field ${fieldname} is required but recieved = ${value}`)
      } else if(typeof value === "string") {
        if(value.length < minlength) {
          err_descriptions.push(`Field ${fieldname} is smaller than minimum length = ${minlength}`)
        }
        if(value.length > maxlength) {
          err_descriptions.push(`Field ${fieldname} is larger than maximum length = ${maxlength}`)
        }
        if(oneof && !oneof.some(o => o === value)) {
          err_descriptions.push(`Field ${fieldname} should be one of the following values [${oneof.join(", ")}]`)
        }
        if(notoneof && notoneof.some(o => o === value)) {
          err_descriptions.push(`Field ${fieldname} should NOT be one of the following values [${notoneof.join(", ")}]`)
        }
        if(startwith && !value.startsWith(startwith)) {
          err_descriptions.push(`Field ${fieldname} should start with = ${startwith}`)
        }
        if(notstartwith && value.startsWith(notstartwith)) {
          err_descriptions.push(`Field ${fieldname} should not start with = ${notstartwith}`)
        }
        if(endwith && !value.endsWith(endwith)) {
          err_descriptions.push(`Field ${fieldname} should end with = ${endwith}`)
        }
        if(notendwith && value.endsWith(notendwith)) {
          err_descriptions.push(`Field ${fieldname} should NOT end with = ${notendwith}`)
        }
        if(contain && (value.search(contain) === -1)) {
          err_descriptions.push(`Field ${fieldname} should contain = ${contain}`)
        }
        if(notcontain && (value.search(notcontain) !== -1)) {
          err_descriptions.push(`Field ${fieldname} should NOT contain = ${notcontain}`)
        }
        if(regex && (value.match(regex) === null)) {
          err_descriptions.push(`Field ${fieldname} has not following the regex rule ${regex}`)
        }
        if(not_allowed_regex && (value.match(not_allowed_regex) !== null)) {
          err_descriptions.push(`Field ${fieldname} contain not allowed regex rule ${not_allowed_regex}`)
        }
      }
      break;
  
    case "number":
      if(required && isNaN(Number(value))) {
        err_descriptions.push(`Field ${fieldname} is required and should be type of number, but recieved = ${value}`)
      }else {
        final_value = Number(value);
      }
      break;
    case "boolean":
      if(required && !(value === true || value === false || value === "true" || value === "false")) {
        err_descriptions.push(`Field ${fieldname} is required and should be type of boolean, but recieved = ${value}`)
      }else {
        if(value === "true" || value === true) {
          final_value = true;
        }else{
          final_value = false;
        }
      }
      break;
    
    case "any": break;
    default: break;
  }
  return { final_value, err_descriptions };

}