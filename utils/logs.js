function logc (color, message)
{
  console.log(`\x1b[${color}m`, message ,'\x1b[0m');
}
function logcc (color1, color2, message1, message2)
{
  console.log(`\x1b[${color1}m`, message1,'\x1b[0m', `\x1b[${color2}m`, message2, '\x1b[0m');
}

function logtextcc (color1, color2, text, message1, message2)
{
  console.log(`${text} \x1b[${color1}m`, message1,'\x1b[0m', `\x1b[${color2}m`, message2, '\x1b[0m');
}

function logtcc (arr, arrclr)
{
  logc(arrclr || 35, "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n")
  arr.map(i => {
    logcc(i[0], i[1], i[2], i[3] + "\n")
  })
  logc(arrclr || 35, "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n")
}
function logpass (message)
{
  logcc(42, 33, "SUCCESS", message)
}
function logerr (message) // -1
{
  logcc(41, 33, "CRITICAL ERROR", message)
}
function logferr (message) // -2 
{
  logcc(41, 33, "FATAL ERROR", message)
}
function logwarn (message) // 1
{
  logcc(43, 33, "WARNING", message)
}
function perflog (arr)
{
  const usearr = [];
  arr.map(i => {
    if(i[0] === -2) { usearr.push([41, 31, "FATAL ERROR", i[1]]) }
    if(i[0] === -1) { usearr.push([41, 31, "CRITICAL ERROR", i[1]]) }
    if(i[0] === 0) { usearr.push([43, 33, "WARNING", i[1]]) }
    if(i[0] === 1) { usearr.push([44, 34, "OK", i[1]]) }
    if(i[0] === 2) { usearr.push([42, 32, "PASSED", i[1]]) }
  })
  logtcc(usearr);
}

module.exports = {

  logc, logcc, logtcc, perflog, logpass, logerr, logferr, logwarn, logtextcc

}