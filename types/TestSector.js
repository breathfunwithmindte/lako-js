const makeid = require("../utils/makeid");

module.exports = class TestSector {

  /**
   * @typedef {Object} Test;
   * @property {String} message;
   * @property {*} expected;
   * @property {*} recieved;
   * @property {String?} description;
   * @property {Boolean} is_success
   * 
   * @typedef {Object} DBTest;
   * @property {String} modelname;
   * @property {Number} initial_count;
   */

  /** @type {string} title */
  title;

  /** @type {Test[]} */
  mini_test = new Array()

  /** @type {Boolean} passed */
  passed = true;

  /** @type {String?} tmp_id */
  #tmp_id;
  
  /** @type {String?} tmp_expect */
  #tmp_expect;

  /** @type {String?} tmp_description */
  #tmp_description;

  // todo i dont know how to use it..lets see later;
  /** @type {DBTest} db_test */
  #tmp_dbtest;

  /** @type {String} tmp_dbmodelname */
  #tmp_dbmodelname;

  /** @type {Number} tmp_dbcount */
  #tmp_dbcount;


  constructor (title)
  {
    this.title = title;
  }

  /**
   * @param {*} value
   * @param {String?} description
   * @returns {TestSector} 
   */
  expect (value, id)
  {
    this.#tmp_expect = value;
    this.#tmp_id = makeid(14);
    this.#tmp_description = id;
    return this;
  }


  /**
   * @param {String} modelname
   * @param {String?} description
   * @returns {TestSector} 
   */
   async expectDB (modelname, id)
   {
     const CurrentModel = pro.Models[modelname];
     if(!CurrentModel) throw new Error("Model not found");
     this.#tmp_dbcount = await CurrentModel.count(); 
     this.#tmp_dbmodelname = modelname;
     return this;
   }

  /** @param {*} value */
  toBe (value)
  {
    if(!this.#tmp_id) throw new Error("Use expect before toBe method.");
    if(this.#tmp_expect == value) { this.mini_test.push({
      message: `Expected value to be ${this.#tmp_expect} and it does. Expected type ${typeof this.#tmp_expect}, Recieved type ${typeof value}`,
      expected: this.#tmp_expect, recieved: value, is_success: true, description: this.#tmp_description
    });} else { 
    this.passed = false;
    this.mini_test.push({
      message: `Expected value to be ${this.#tmp_expect} but recieved ${value}. Expected type ${typeof this.#tmp_expect}, Recieved type ${typeof value}`,
      expected: this.#tmp_expect, recieved: value, is_success: false, description: this.#tmp_description
    });}
    this.#tmp_expect = undefined; this.#tmp_id = undefined; this.#tmp_description = undefined; 
  }

  toNotBe (value)
  {
    if(!this.#tmp_id) throw new Error("Use expect before toNotBe method.");
    if(this.#tmp_expect != value) { this.mini_test.push({
      message: `Expected value to not be ${this.#tmp_expect} and it does. Expected type ${typeof this.#tmp_expect}, Recieved type ${typeof value}`,
      expected: this.#tmp_expect, recieved: value, is_success: true, description: this.#tmp_description
    });} else { 
    this.passed = false;
    this.mini_test.push({
      message: `Expected value to not be ${this.#tmp_expect} but recieved ${value}. Expected type ${typeof this.#tmp_expect}, Recieved type ${typeof value}`,
      expected: this.#tmp_expect, recieved: value, is_success: false, description: this.#tmp_description
    });}
    this.#tmp_expect = undefined; this.#tmp_id = undefined; this.#tmp_description = undefined;
  }

    /** @param {*} value */
    toBeExact (value)
    {
      if(!this.#tmp_id) throw new Error("Use expect before toBeExact method.");
      if(this.#tmp_expect === value) { this.mini_test.push({
        message: `Expected value to be exact ${this.#tmp_expect} and it does. Expected type ${typeof this.#tmp_expect}, Recieved type ${typeof value}`,
        expected: this.#tmp_expect, recieved: value, is_success: true, description: this.#tmp_description
      });} else { 
      this.passed = false;
      this.mini_test.push({
        message: `Expected value to be exact ${value} but recieved ${value}. Expected type ${typeof this.#tmp_expect}, Recieved type ${typeof value}`,
        expected: this.#tmp_expect, recieved: value, is_success: false, description: this.#tmp_description
      });}
      this.#tmp_expect = undefined; this.#tmp_id = undefined; this.#tmp_description = undefined;
    }

    /** @param {*} value */
    toNotBeExact (value)
    {
      if(!this.#tmp_id) throw new Error("Use expect before toNotBeExact method.");
      if(this.#tmp_expect !== value) { this.mini_test.push({
        message: `Expected value to not be exact ${this.#tmp_expect} and it does. Expected type ${typeof this.#tmp_expect}, Recieved type ${typeof value}`,
        expected: this.#tmp_expect, recieved: value, is_success: true, description: this.#tmp_description
      });} else { 
      this.passed = false;
      this.mini_test.push({
        message: `Expected value to not be exact ${value} but recieved ${value}. Expected type ${typeof this.#tmp_expect}, Recieved type ${typeof value}`,
        expected: this.#tmp_expect, recieved: value, is_success: false, description: this.#tmp_description
      });}
      this.#tmp_expect = undefined; this.#tmp_id = undefined; this.#tmp_description = undefined;
    }

    isArray()
    {
      if(!this.#tmp_id) throw new Error("Use expect before isArray method.");
      if(this.#tmp_expect instanceof Array === true) { this.mini_test.push({
        message: `Expected value to be an array and it does.`,
        expected: this.#tmp_expect, recieved: null, is_success: true, description: this.#tmp_description
      });} else { 
      this.passed = false;
      this.mini_test.push({
        message: `Expected value to be an array but it is ${this.#tmp_expect}. Type is ${typeof this.#tmp_expect}`,
        expected: this.#tmp_expect, recieved: null, is_success: false, description: this.#tmp_description
      });}
      this.#tmp_expect = undefined; this.#tmp_id = undefined; this.#tmp_description = undefined;
    }

    async db_inserted ()
    {
      if(this.#tmp_dbcount === undefined || !this.#tmp_dbmodelname) throw new Error("Use expectDB first.");
      const CurrentModel = pro.Models[this.#tmp_dbmodelname];
      if(!CurrentModel) throw new Error("Model not found");
      const newcount = await CurrentModel.count();

      if(this.#tmp_dbcount === newcount - 1) { this.mini_test.push({
        message: `Expected the current documents length to be +1 from the expected one and it does. Initial count was ${this.#tmp_dbcount}`,
        expected: this.#tmp_dbcount, recieved: newcount, is_success: true, description: this.#tmp_description
      });} else { 
      this.passed = false;
      this.mini_test.push({
        message: `Expected the current documents length to be +1 from the expected but we have now ${newcount}. Initial count was ${this.#tmp_dbcount}`,
        expected: this.#tmp_dbcount, recieved: newcount, is_success: false, description: this.#tmp_description
      });}
      this.#tmp_dbmodelname = undefined; this.#tmp_dbcount = undefined;
    }

    async db_many_inserted ()
    {
      if(this.#tmp_dbcount === undefined || !this.#tmp_dbmodelname) throw new Error("Use expectDB first.");
      const CurrentModel = pro.Models[this.#tmp_dbmodelname];
      if(!CurrentModel) throw new Error("Model not found");
      const newcount = await CurrentModel.count();

      if(this.#tmp_dbcount < newcount) { this.mini_test.push({
        message: `Expected the current documents length to be >> from the expected one and it does. Initial count was ${this.#tmp_dbcount}, Current is ${newcount}`,
        expected: this.#tmp_dbcount, recieved: newcount, is_success: true, description: this.#tmp_description
      });} else { 
      this.passed = false;
      this.mini_test.push({
        message: `Expected the current documents length to be >> from the expected but we have now ${newcount}. Initial count was ${this.#tmp_dbcount}`,
        expected: this.#tmp_dbcount, recieved: newcount, is_success: false, description: this.#tmp_description
      });}
      this.#tmp_dbmodelname = undefined; this.#tmp_dbcount = undefined;
    }

    async db_deleted ()
    {
      if(this.#tmp_dbcount === undefined || !this.#tmp_dbmodelname) throw new Error("Use expectDB first.");
      const CurrentModel = pro.Models[this.#tmp_dbmodelname];
      if(!CurrentModel) throw new Error("Model not found");
      const newcount = await CurrentModel.count();

      if(this.#tmp_dbcount === newcount + 1) { this.mini_test.push({
        message: `Expected the current documents length to be -1 from the expected one and it does. Initial count was ${this.#tmp_dbcount}`,
        expected: this.#tmp_dbcount, recieved: newcount, is_success: true, description: this.#tmp_description
      });} else { 
      this.passed = false;
      this.mini_test.push({
        message: `Expected the current documents length to be -1 from the expected but we have now ${newcount}. Initial count was ${this.#tmp_dbcount}`,
        expected: this.#tmp_dbcount, recieved: newcount, is_success: false, description: this.#tmp_description
      });}
      this.#tmp_dbmodelname = undefined; this.#tmp_dbcount = undefined;
    }

    async db_many_deleted ()
    {
      if(this.#tmp_dbcount === undefined || !this.#tmp_dbmodelname) throw new Error("Use expectDB first.");
      const CurrentModel = pro.Models[this.#tmp_dbmodelname];
      if(!CurrentModel) throw new Error("Model not found");
      const newcount = await CurrentModel.count();

      if(this.#tmp_dbcount > newcount) { this.mini_test.push({
        message: `Expected the current documents length to be << from the expected one and it does. Initial count was ${this.#tmp_dbcount}, Current is ${newcount}`,
        expected: this.#tmp_dbcount, recieved: newcount, is_success: true, description: this.#tmp_description
      });} else { 
      this.passed = false;
      this.mini_test.push({
        message: `Expected the current documents length to be << from the expected but we have now ${newcount}. Initial count was ${this.#tmp_dbcount}`,
        expected: this.#tmp_dbcount, recieved: newcount, is_success: false, description: this.#tmp_description
      });}
      this.#tmp_dbmodelname = undefined; this.#tmp_dbcount = undefined;
    }

    async db_updated ()
    {
      /**
       * this one is the most hard ...
       * todo it later in versions 2-3 after initial published; 
       */
      throw new Error("Method <db_updated> is not implemented. Comming soon ...");
    }




}