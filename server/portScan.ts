const schedule = require('node-schedule');
const { exec } = require("child_process");
const xml2js = require('xml2js');
var parser = new xml2js.Parser();
const data = ['91.12.98.74','209.195.2.50', '194.35.86.10'];
var openPorts = [{ip: '91.12.98.74', openPorts:[{protocol: 'tcp' , portid: '4442'  }]},
{ip: '209.195.2.50', openPorts:[{protocol: 'tcp' , portid: '4442'  }]},
{ip: '194.35.86.10', openPorts:null}];


/**
 * getRandomDate is used to schedule the next batch of scans in a pseudo random manner for the next day
 * @returns Date object with incremented day by 1 and random hour and minutes
 */
function getRandomDate(){
  var datetime = new Date();
  //datetime.setDate(datetime.getDate()+1);
  //datetime.setHours(Math.floor(Math.random()*23));
  //datetime.setMinutes(Math.floor(Math.random()*60));
  datetime.setMinutes(datetime.getMinutes()+2);
  console.log("NEXT SCAN FOR "+datetime);
  return datetime;
}


function scheduleAJob(){
  const job = schedule.scheduleJob(getRandomDate(), function(){
    console.log('- - - BEGINNING  PORT  SCAN - - -');
    portScan(openPorts).then(scheduleAJob());
    
  });
}

function stringListMaker(arryOfPortObjects){
  if(arryOfPortObjects.length==0) return null;
  var out = '';
  for(var i = 0; i < arryOfPortObjects.length-1; i++){
    out +=arryOfPortObjects[i].portid+',';
  }
  out+=arryOfPortObjects[arryOfPortObjects.length-1].portid;
  return out;
}
async function portScan(listOfIPs){
  
  for(var ip in listOfIPs){
    let mapUnique = new Map();
    if(listOfIPs[ip].openPorts == null) continue;
    var out = [];
    var out1 = await checkSpecificports(listOfIPs[ip].ip, stringListMaker(listOfIPs[ip].openPorts));
    if(out1 != null && out1){
      for(var i in out1.openPorts){
        mapUnique.set(out1.openPorts[i].portid, out1.openPorts[i].portid);
        out.push(out1.openPorts[i].portid);
      }
    }
    var out2  = await defScanOfIp(listOfIPs[ip].ip);

    if(out2 != null && out2){
      for(var i in out2.openPorts){
        if(mapUnique.has(out2.openPorts[i].portid)){
          console.log("Duplicate "+ out2.openPorts[i])
        }else{
          out.push(out2.openPorts[i].portid);
        }
      }
    }
    if(out2!=null){
      listOfIPs[ip].openPorts = out2.openPorts;
    }
    // listOfIPs[ip].openPorts = out;
    
  }
  openPorts=listOfIPs;
  console.log(openPorts);
  // DEBUGGING:
  // for(var ip in openPorts){
  //   console.log(openPorts[ip].ip+":");
  //   if(openPorts[ip].openPorts){
  //     for (var port in openPorts[ip].openPorts){
      
  //       console.log(openPorts[ip].openPorts[port]);
  //     }
  //   }
  // }

}

function defScanOfIp(IP){
  return new Promise(resolve => {
    exec("nmap "+IP + " -Pn -oX -", (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        resolve(null);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        resolve(null);
        return;
      }
      var out = stdout;
      parser.parseString(out, function (err, result) {
        var buff  = result.nmaprun.host[0].ports[0].port;
        var outData=Array();
        if(buff){
          for(var port in buff){
            if(buff[port].state[0].$.state && buff[port].state[0].$.state=='open'){
              outData.push(buff[port].$);
            }
          }
          resolve({ip: IP, openPorts: outData});
          return;
        }
        resolve(null);
        return;
      });

    
    });
  });
}


function checkSpecificports(IP, portList){
  return new Promise(resolve => {
    exec("nmap "+IP + " -Pn -oX - -p "+portList, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        resolve(null);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        resolve(null);
        return;
      }
      var out = stdout;
      parser.parseString(out, function (err, result) {
        var buff  = result.nmaprun.host[0].ports[0].port;
        var outData=Array();
        if(buff){
          for(var port in buff){
            if(buff[port].state[0].$.state && buff[port].state[0].$.state=='open'){
              outData.push(buff[port].$);
            }
          }
          resolve({ip: IP, openPorts: outData});
          return;
        }
        resolve(null);
        return;
      });

    
    });
  });
}

portScan(openPorts);
scheduleAJob();



/*
 New Node added - FULL SCAN (~ 4 hours)
 Open Ports - Most common + any open ports we found

 TODO: Full Scan
*/