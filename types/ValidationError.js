module.exports = class ValidationError {

  /**
   * @type {String} namespace
   */
  namespace;

  /**
   * @type {String} field;
   */
  field;

  /**
   * @type {String[]} descriptions;
   */
  descriptions;

  constructor (namespace, field, descriptions) {
    this.namespace = namespace;
    this.field = field;
    if(typeof descriptions === "string") {
      this.descriptions = [descriptions];
    } else {
      this.descriptions = descriptions || []
    }
    
  }

  toObject () {
    return {
      namespace: this.namespace,
      field: this.field,
      descriptions: this.descriptions
    }
  }
  
}