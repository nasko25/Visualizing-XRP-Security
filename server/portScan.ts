
import * as schedule from 'node-schedule';
import * as exec from 'child_process';
import * as xml2js from 'xml2js';
var parser = new xml2js.Parser();
const data = ['91.12.98.74','209.195.2.50', '194.35.86.10'];
var openPorts: Node[] = [{ip: '91.12.98.74', openPorts:[{protocol: 'tcp' , portid: '4442'  }]},
{ip: '209.195.2.50', openPorts:[{protocol: 'tcp' , portid: '4442'  }]},
{ip: '194.35.86.10', openPorts:[]}];

interface ProtocolPortid{
  protocol: string,
  portid: string
}
interface Node{
  ip: string,
  openPorts: ProtocolPortid[]
}

class PortScan{

  constructor(){

  }
  /**
   * getRandomDate is used to schedule the next batch of scans in a pseudo random manner for the next day
   * @returns Date object with incremented day by 1 and random hour and minutes
   */
  getRandomDate(){
    var datetime = new Date();
    //datetime.setDate(datetime.getDate()+1);
    //datetime.setHours(Math.floor(Math.random()*23));
    //datetime.setMinutes(Math.floor(Math.random()*60));
    datetime.setMinutes(datetime.getMinutes()+2);
    console.log("NEXT SCAN FOR "+datetime);
    return datetime;
  }


  scheduleAJob(){
    const job = schedule.scheduleJob(this.getRandomDate(), () =>{
      console.log('- - - BEGINNING  PORT  SCAN - - -');
      this.portScan(openPorts).then(()=>this.scheduleAJob());
      
    });
  }

  stringListMaker(arryOfPortObjects: ProtocolPortid[]){
    if(arryOfPortObjects.length==0) return null;
    var out = '';
    for(var i = 0; i < arryOfPortObjects.length-1; i++){
      out +=arryOfPortObjects[i].portid+',';
    }
    out+=arryOfPortObjects[arryOfPortObjects.length-1].portid;
    return out;
  }

  async portScan(listOfNodes: Node[]){
    
    for(var ip in listOfNodes){
      let mapUnique = new Map();
      if(listOfNodes[ip].openPorts == null) continue;
      let out: ProtocolPortid[] = [];
      console.log("First Scan")
      let portListString: string | null = this.stringListMaker(listOfNodes[ip].openPorts)
      if(portListString!=null){
        let out1: Node | null = await this.checkSpecificports(listOfNodes[ip].ip, portListString);
        if(out1 != null && out1){
          for(var i in out1.openPorts){
            mapUnique.set(out1.openPorts[i].portid, out1.openPorts[i].portid);
            out.push(out1.openPorts[i]);
          }
        }
      }
      console.log("Second scan")
      var out2  = await this.defScanOfIp(listOfNodes[ip].ip);
      console.log(out2);
      if(out2 != null && out2){
        for(var i in out2.openPorts){
          if(mapUnique.has(out2.openPorts[i].portid)){
            console.log("Duplicate "+ out2.openPorts[i])
          }else{
            out.push(out2.openPorts[i]);
          }
        }
      }
      if(out!=null){
        listOfNodes[ip].openPorts = out;
      }
      // listOfIPs[ip].openPorts = out;
      
    }
    openPorts=listOfNodes;
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

  defScanOfIp(IP: string){
    return new Promise<Node | null>(resolve => {
      exec.exec("nmap "+IP + " -Pn -oX -", (error, stdout, stderr) => {
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
        parser.parseString(out, function (err: any, result: any) {
          var buff  = result.nmaprun.host[0].ports[0].port;
          var outData=Array();
          if(buff){
            for(var port in buff){
              if(buff[port].state[0].$.state && buff[port].state[0].$.state=='open'){
                outData.push(buff[port].$);
              }
            }
            let returnVal: Node = {ip: IP, openPorts: outData};
            resolve(returnVal);
            return;
          }
          resolve(null);
          return;
        });

      
      });
    });
  }


  checkSpecificports(IP: string, portList: string | null){
    return new Promise<Node | null>(resolve => {
      exec.exec("nmap "+IP + " -Pn -oX - -p "+portList, (error, stdout, stderr) => {
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
        parser.parseString(out, function (err: any, result: any) {
          var buff  = result.nmaprun.host[0].ports[0].port;
          var outData=Array();
          if(buff){
            for(var port in buff){
              if(buff[port].state[0].$.state && buff[port].state[0].$.state=='open'){
                outData.push(buff[port].$);
              }
            }
            var returnVal: Node = {ip: IP, openPorts: outData};
            resolve(returnVal);
            return;
          }
          resolve(null);
          return;
        });

      
      });
    });
  }
  start(){
    this.portScan(openPorts).then(()=>this.scheduleAJob());
  }
  

}
var test = new PortScan();
test.start();
export default PortScan;
/*
 New Node added - FULL SCAN (~ 4 hours)
 Open Ports - Most common + any open ports we found

 TODO: Full Scan
*/
