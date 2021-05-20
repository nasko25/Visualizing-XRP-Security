import * as schedule from 'node-schedule';
import * as exec from 'child_process';
import * as xml2js from 'xml2js';
import * as dbCon from "./db_connection/db_helper";
import {NodePorts, NodePortsProtocols, NodePortsNull} from "./db_connection/models/node";
var parser = new xml2js.Parser();
const data: NodePorts[] = [{ip: '194.35.86.10', public_key: 'pk', ports: '404'},
{ip: '209.195.2.50', public_key: 'pk', ports: '42,23'},{ip: '91.12.98.74', public_key: 'pk', ports: '42,23'}, {ip: '::ffff:35.184.126.128', public_key: 'pk', ports: ''}]
const data2: NodePortsNull[] = [{ip: '::ffff:35.184.126.128', public_key: 'pk'},
{ip: '209.195.2.50', public_key: 'pk'},{ip: '91.12.98.74', public_key: 'pk'},{ip: '127.0.0.1', public_key: 'pk'}]


const Tlevel: number = 3;


interface ProtocolPortid{
  protocol: string,
  portid: string
}
interface Node{
  ip: string,
  openPorts: ProtocolPortid[]
}
//nmap 127.0.0.1 209.195.2.50 -p 0-4000
class PortScan{
  constructor(){

  }

  async wait(seconds: number){

    return new Promise(resolve => setTimeout(resolve, seconds*1000));
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
      this.start();
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



  async longScan(listOfNodes: NodePortsNull[], m: number, n: number){
        
        if(n>=listOfNodes.length){
          await this.wait(30);
          n=0;
          m+=1000;
        }
        if(m>65355) return;
        
          var promisesArr = [] ;
          var i = 0;
          while(n<listOfNodes.length && i<2){
            promisesArr.push(this.checkRange(listOfNodes[n].ip, m));
            i++;
            n++;
          }
          console.log("PROMISES WE HAVE "+promisesArr.length)
          Promise.all(promisesArr).then((value: (Node | null)[]) => {
            for(var count in value){
              console.log(value[count]?.ip+": ");
              console.log(value[count]?.openPorts);
            }
            console.log("Starting next batch: "+m + " "+n)
            this.longScan(listOfNodes, m, n)
          });
        
      
  }
  async portScan(listOfNodes: NodePorts[]){
    
    for(var ip in listOfNodes){
      var mapUnique = new Map();
      if(listOfNodes[ip].ports == null) continue;
      var outPorts: string = '';
      var outProtocols: string = '';
      console.log("First Scan")
      var flag  = 0;
      var success1  = false;
      var success2 = false;

      try{
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
          success1 = true;
        }
      }catch (err){
        console.log(err);
      }
      
      
      console.log("Second scan")
      try{
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
          success2 = true;
        }
      }catch(err){
        console.log(err);
      }
      if(success2 || success1){
        console.log(listOfNodes[ip].ip + " "+outPorts);
        // var putin: NodePortsProtocols = {ip: listOfNodes[ip].ip, public_key: listOfNodes[ip].public_key, ports: outPorts, protocols: outProtocols}
        // dbCon.insertPorts(putin);
        
        // listOfIPs[ip].openPorts = out;
      }else{
        console.log("Host may be down");
      }
      
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
      var add = '-4';
      if(IP.includes(":")){
        add = '-6';
      }
      exec.exec("nmap "+IP + " -Pn -T3 "+add+" -oX -", {maxBuffer: Infinity}, (error, stdout, stderr) => {
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
          if(result.nmaprun.host[0].status[0].$.state.includes('down')) throw new Error("Host is down");
          var buff  = result.nmaprun.host[0].ports[0].port;
          var outData=Array();
          if(buff){
            for(var port in buff){
              if(buff[port].state[0].$.state && buff[port].state[0].$.state=='open'){
                console.log({protocol: buff[port].service[0].$.name, portid: buff[port].$.portid })
                outData.push({protocol: buff[port].service[0].$.name, portid: buff[port].$.portid });
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
      var add = '-4';
      if(IP.includes(":")){
        add = '-6';
      }
      exec.exec("nmap "+IP + " -Pn -T3 "+ add +" -oX - -p "+portList, {maxBuffer: Infinity}, (error, stdout, stderr) => {
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
          if(result.nmaprun.host[0].status[0].$.state.includes('down')) throw new Error("Host is down");
          var buff  = result.nmaprun.host[0].ports[0].port;
          var outData=Array();
          if(buff){
            for(var port in buff){
              if(buff[port].state[0].$.state && buff[port].state[0].$.state=='open'){
                outData.push({protocol: buff[port].service[0].$.name, portid: buff[port].$.portid });
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
  checkRange(IP: string, start: number){
    
    console.log(" checking "+IP + "with start "+start)
    return new Promise<Node | null>(resolve => {
      if(start>65355){
        resolve(null);
        return;
      }
      var add = '-4';
      if(IP.includes(":")){
        add = '-6';
      }
      var end = Math.min(start+999, 65355);
      exec.exec("nmap "+IP + " -Pn -T4 "+ add +" -oX - -p "+start+"-"+end, (error, stdout, stderr) => {
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
    // dbCon.getNodesNonNullPort((result)=>{
    //   this.portScan(result).then(()=>this.scheduleAJob());
    // });
    //this.longScan(data2,0,0);
    this.portScan(data).then(()=>this.scheduleAJob());
  }
  

}
//Debug:
// var test = new PortScan();
// test.start();
export default PortScan;

/*
 New Node added - FULL SCAN (~ 4 hours)
 Open Ports - Most common + any open ports we found
*/
