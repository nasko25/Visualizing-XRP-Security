
import * as schedule from 'node-schedule';
import * as exec from 'child_process';
import * as xml2js from 'xml2js';
import * as dbCon from "./db_connection/db_helper";
import {NodePorts, NodePortsProtocols} from "./db_connection/models/node";
var parser = new xml2js.Parser();
const data: NodePorts[] = [{ip: '194.35.86.10', public_key: 'pk', ports: '42,23'},
{ip: '209.195.2.50', public_key: 'pk', ports: '42,23'},{ip: '91.12.98.74', public_key: 'pk', ports: '42,23'}]

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
   * @returns Date object with incremented day by x and random hour and minutes
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
      //this.portScan(openPorts).then(()=>this.scheduleAJob());
      
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

  async portScan(listOfNodes: NodePorts[]){
    
    for(var ip in listOfNodes){
      var mapUnique = new Map();
      if(listOfNodes[ip].ports == null) continue;
      var outPorts: string = '';
      var outProtocols: string = '';
      console.log("First Scan")
      var flag  = 0;
     
        let out1: Node | null = await this.checkSpecificports(listOfNodes[ip].ip, listOfNodes[ip].ports);
        if(out1 != null && out1){
          var i:number = 0; 
          if(out1.openPorts.length > 0){
            mapUnique.set(out1.openPorts[i].portid, out1.openPorts[i].portid);
            outPorts = out1.openPorts[i].portid;
            outProtocols = out1.openPorts[i].protocol;
            i++;
            flag  = 1;
          }
          while(i < out1.openPorts.length){
            mapUnique.set(out1.openPorts[i].portid, out1.openPorts[i].portid);
            outPorts+=','+out1.openPorts[i].portid;
            outProtocols+=','+out1.openPorts[i].protocol;
            i++;
          }
        }
      
      console.log("Second scan")
      var out2  = await this.defScanOfIp(listOfNodes[ip].ip);
      console.log("done "+out2);
      if(out2 != null && out2){
        var i: number = 0;
        if(flag == 0){
          outPorts = out2.openPorts[i].portid;
          outProtocols = out2.openPorts[i].protocol;
          i++;
        }
        console.log(flag);
        while(i < out2.openPorts.length){
          if(mapUnique.has(out2.openPorts[i].portid)){
            console.log("Duplicate "+ out2.openPorts[i])
          }else{
            outPorts+=','+out2.openPorts[i].portid;
            outProtocols+=','+out2.openPorts[i].protocol;
          }
          i++;
        }
      }
      
      console.log(listOfNodes[ip].ip + " "+outPorts);
      var putin: NodePortsProtocols = {ip: listOfNodes[ip].ip, public_key: listOfNodes[ip].public_key, ports: outPorts, protocols: outProtocols}
      dbCon.insertPorts(putin);
      
      // listOfIPs[ip].openPorts = out;
      
    }
    
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
      exec.exec("nmap "+IP + " -Pn -T4 -oX -", (error, stdout, stderr) => {
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
      exec.exec("nmap "+IP + " -Pn -T4 -oX - -p "+portList, (error, stdout, stderr) => {
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
    dbCon.getNodesNonNullPort((result)=>{
      this.portScan(result).then(()=>this.scheduleAJob());
    });

    //this.portScan(data).then(()=>this.scheduleAJob());
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
