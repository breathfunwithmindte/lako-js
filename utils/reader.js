const fs = require("fs");

module.exports = function deepreaddir (dir, cb=()=>{return true})
{
  const result = new Array();
  loopprocess(dir);
  function loopprocess (dir) 
  {
    const items = fs.readdirSync(dir);
    items.map(item => {
      if(!cb(item)) return;
      if(fs.lstatSync(dir + "/" + item).isFile())
      {
        result.push({ filename: item, fulldir: dir + "/" + item });
      }else{
        loopprocess(dir + "/" + item)
      }
    })
  }
  return result;
}