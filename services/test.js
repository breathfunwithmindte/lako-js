module.exports = async function ()
{
  const test_controllers = Array.from(pro.TestControllers);

    console.time("test finished in: ")

    const Logs = require("../utils/logs")
    const MpTest = require("../types/MpTest");

    const result_testings = []; // { testname:str, passed:bool }

    for (let tindex = 0; tindex < test_controllers.length; tindex++) {
        const [key, controller] = test_controllers[tindex];
        const all_mp_tests = [];


        for (let i = 0; i < controller.test_them.length; i++) {
            const mptest = new MpTest()
            await controller[controller.test_them[i]](mptest);
            all_mp_tests.push(mptest);
            
        }
        for (let j = 0; j < all_mp_tests.length; j++) {
            const current_mp_test = all_mp_tests[j];
            Logs.logc(35, "\n\n^^^^^^^^^^^^^^^^^^^^^^^^^" + `   ${key.split("").join(" ").toUpperCase()}   ` + "^^^^^^^^^^^^^^^^^^^^^^^^^\n");
            await current_mp_test.execute();
            current_mp_test.final.map(sector => {
                if(sector.passed) {
                    Logs.logtextcc(44, 36, "\t", "P A S S E D  +++++ ", ` ${sector.title ? sector.title.toUpperCase() : "title not found"} ~~~~~~~~~~~~~~\n`);
                } else {
                    Logs.logtextcc(41, 33, "\t",  "F A I L E D  ----- ", `${sector.title ? sector.title.toUpperCase() : "title not found"} ~~~~~~~~~~~~~~\n`);
                }
                sector.mini_test.map((elm, i) => {
                    if(elm.is_success) { Logs.logtextcc(42, 32, `\t\t${i}.\t`, `PASSED`, `${elm.description ? `[${elm.description}]` : ""} \t ${elm.message}`) } 
                    else { Logs.logtextcc(41, 31, `\t\t${i}.\t`, `FAILED`, `${elm.description ? `[${elm.description}]` : ""} \t ${elm.message}`) ; }
                })
                console.log("\n")
            })
            Logs.logc(35, "_________________________" + `   E N D   ${key.split("").join(" ").toUpperCase()}   ` + "_________________________\n\n")
            result_testings.push({ testname: key, passed: current_mp_test.pass })
        }

    }
    console.log("\n R E S U L T S : \n")
    Logs.logcc(32, 34, `[ T O T A L   P A S S E D ]`, result_testings.filter(f => f.passed === true).length.toString())
    Logs.logcc(31, 33, `[ T O T A L   F A I L E D ]`, result_testings.filter(f => f.passed === false).length.toString())
    console.log("\n\n")
    console.timeEnd("test finished in: ")
    console.log("\n\n")
}