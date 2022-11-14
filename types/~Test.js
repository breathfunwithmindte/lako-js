/**
 * @interface
 */
module.exports = class Test {

  constructor ()
  {
    const demo_sectors = [
      {
        title: "asdsadsadasdsadasdasd",
        mini_tests: [ 
          { 
            recieved: null, 
            expected: 401, 
            recieved_string: "mperror", 
            expected_string: "mperror", 
            message: "Expected %%expected%% to be %%recieved%%" 
          }
        ]
      }
    ]
    this.sectors = new Array();
  }

  expect (){}

  /**
   * @param {*} type most times is recieve a primitive type;
   * @returns {void} all methods below are void;
   */
  toBe () {}
  toNotBe() {}

  isArray(){}
  isNotArray(){}
  isArrayOfNumbers()
  isArrayOfString()

  isObject(){} // simple check if result is object and not array;
  hasProperties(){} // take a list of string - properties that should be defined into the object;
  shouldNotHaveProperties(){} // take a list of string - properties that should not be defined into the object;
  isKnowError(){} // check if status of response is one of know error statuses list;
  isUnknowError(){} 

  isMpError (){}
  isGResponse (){}
  isGResponseWithError (){}
  isRender(){}

}