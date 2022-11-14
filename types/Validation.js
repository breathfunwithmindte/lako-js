module.exports = class Validation {

  /** @type {String} type */
  type;
  /** @type {Boolean} required */
  required;
  /** @type {Boolean} isarray */
  isarray;
  /** @type {Number} minlength */
  minlength;
  /** @type {Number} maxlength */
  maxlength;

  /** @type {String} startwith */
  startwith;
  /** @type {String} notstartwith */
  notstartwith;
  /** @type {String} endwith */
  endwith;
  /** @type {String} notendwith */
  notendwith;
  /** @type {String} contain */
  contain;
  /** @type {String} notcontain */
  notcontain;
  /** @type {String} regex */
  regex;
  /** @type {String} not_allowed_regex */
  not_allowed_regex;

  /** @type {String[]} oneof */
  oneof;
  /** @type {String[]} notoneof */
  notoneof;

}

