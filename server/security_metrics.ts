import axios from "axios";
import EventEmitter from "events";
import * as formulas from "./formulas"
import Logger from "./logger";

interface VersionInfo{
    index: number;
    tagName: string;
    publishDate: Date;
    scoreRelease : number;
    scoreIndex: number;
}
export default class SecurityMetric {
    HOURS_UNTIL_NEXT_UPDATE: number = 2;

    a: number = 0.6;
    b: number = 1.1;
    c: number = -0.6;

    a1: number = 1.1;
    b1: number = 1.05;
    c1: number = -1.1;

    a_quadr: number = -0.005;
    b_quadr: number = -0.2;
    c_quadr: number = 1;
    
    weeks_grace_period: number = 2;
    ports_grace_number: number = 1;

    cutoff: number = -1000;
    decimal_to_round_to: number = 2;

    verboseLevel: number = 1;

    listOfVersions: Map<string, VersionInfo>;
    listOfVersionsBuffer: Map<string, VersionInfo>;
    latestVersion: string = "";
    constructor(hoursTNU?: number, cutoff?: number, roundToDecimals?: number, a_power?: number, b_power?: number, c_power?: number,
        a_quadr?: number, b_quadr?: number, c_quadr?: number, weeks_gp?: number, prts_gn?: number) {
        this.listOfVersionsBuffer = new Map();
        this.listOfVersions = new Map();
        
        if(cutoff!=undefined) this.cutoff = cutoff;
        if(roundToDecimals!=undefined) this.decimal_to_round_to = roundToDecimals;
        if(a_power!=undefined) this.a1 = a_power;
        if(b_power!=undefined) this.b1 = b_power;
        if(c_power!=undefined) this.c1 = c_power;
        if(a_quadr!=undefined) this.a_quadr = a_quadr;
        if(b_quadr!=undefined) this.b_quadr = b_quadr;
        if(c_quadr!=undefined) this.c_quadr = c_quadr;
        if(weeks_gp!=undefined) this.weeks_grace_period = weeks_gp;
        if(prts_gn!=undefined) this.ports_grace_number = prts_gn;

        // this.listOfVersions.set('1.7.2',0);
        // this.listOfVersions.set('1.7.0',1);
        // this.listOfVersions.set('1.6.0',2);
        // this.listOfVersions.set('1.5.1',3);
        // this.listOfVersions.set('1.5.0',4);
    }

    start(evntEmit: EventEmitter) {
        try {
            this.checkForUpdate(evntEmit);
        } catch (err) {
            if(this.verboseLevel > 0) Logger.error("Could not update the list " + err.message)
        }
    }

    rateVersionBasedOnRelease(difference: number, evalFunction:(x:number, a?: number, b?: number, c?: number, cutoff?: number, decimals?: number)=>number): number {
        if(difference>=0){
            return evalFunction(difference,this.a1,this.b1,this.c1,this.cutoff,this.decimal_to_round_to)
            //return index == undefined ? -1000 : Math.max(-1000, 100-100*(a*(Math.pow(b,index.index))+c))
        }else{
            return this.cutoff;
        }
        
    }

    getRating(version: string){
        var v = this.listOfVersions.get(version);
        if(v==undefined) v=this.listOfVersions.get(version.slice(8))
        
        return v==undefined ? [this.cutoff, this.cutoff] : [v.scoreIndex, v.scoreRelease]
    }

    rateVersionBasedOnIndex(index:number, evalFunction: (x:number, a?: number, b?: number, c?: number, cutoff?: number, decimals?: number)=>number):number {
        return evalFunction(index,this.a,this.b,this.c,this.cutoff,this.decimal_to_round_to);
    }

    rateBasedOnOpenPorts(ports:number){
        ports = Math.max(0, ports-this.ports_grace_number);
        return formulas.quadratic_function(ports, this.a_quadr, this.b_quadr, this.c_quadr, this.cutoff, this.decimal_to_round_to);
    }
    
    //Rate Limit is 60 requests per hour so be careful!
    checkForUpdate(evntEmit: EventEmitter) {
        axios.get(`https://api.github.com/repos/ripple/rippled/releases`,
            { timeout: 6000, params: { page: 1 } }
        ).then((res) => {

            if (res.status == 200) {
                if (res.data && res.data.length > 0) {

                    if (false) {

                        console.log("No update needed");
                        setTimeout(() => this.checkForUpdate(evntEmit), this.HOURS_UNTIL_NEXT_UPDATE*60*60 * 1000);
                        return;
                    } else {
                        this.latestVersion ="rippled-" + res.data[0].tag_name;
                        if(this.verboseLevel > 2)  console.log("update needed "+res.data[0].tag_name + " had index "+this.listOfVersions.get(res.data[0]))
                        var i = 0;
                        
                        this.listOfVersionsBuffer.clear();
                        var prev: VersionInfo | undefined = undefined;
                        res.data.map((tag: any) => {
                            var difference = 0;
                            if(prev!=undefined){
                                difference = Math.max((((new Date()).getTime()-prev.publishDate.getTime())/(7*1000*60*60*24))-this.weeks_grace_period, 0);
                                
                            }
                            
                            var curr: VersionInfo = {index: i, publishDate: new Date(tag.published_at), tagName: tag.tag_name,
                                scoreIndex: this.rateVersionBasedOnIndex(i,formulas.power_function),
                                scoreRelease: this.rateVersionBasedOnRelease(difference, formulas.power_function)};
                            
                            this.listOfVersionsBuffer.set(tag.tag_name, curr);
                            prev=curr;
                            i++;
                        })
                        //this.updateListOfVersions(2, i, prev);
                        this.listOfVersions = this.listOfVersionsBuffer;
                        if(this.verboseLevel > 2) console.log("finished updating the list")
                        evntEmit.emit('done');
                        setTimeout(() => this.checkForUpdate(evntEmit), this.HOURS_UNTIL_NEXT_UPDATE*60*60 * 1000);

                        return;
                    }

                } else {
                    if(this.verboseLevel>0) Logger.error("Could not update the list. No data");
                }
            } else {
                if(this.verboseLevel>0) Logger.error("Could not update the list. Status of request: " + res.status);
            }


        }).catch((err) => {
            if(this.verboseLevel>0) Logger.error("Could not update the list " + err.message);
        });
    }

    //The api may not return all the versions. Keep querying until we run out of data.
    //Also the rate limit is 60 requests per hour so be careful.
    updateListOfVersions(pageNumber: number, i: number, prev: VersionInfo) {

        axios.get(`https://api.github.com/repos/ripple/rippled/tags`,
            { timeout: 6000, params: { page: pageNumber } }
        ).then((res) => {

            if (res.status == 200) {
                if (res.data && res.data.length > 0) {
                   
                    res.data.map((tag: any) => {
                        var difference = 0;
                            if(prev!=undefined){
                                difference = Math.max((((new Date()).getTime()-prev.publishDate.getTime())/(7*1000*60*60*24))-2, 0);
                                
                            }
                            
                            var curr: VersionInfo = {index: i, publishDate: new Date(tag.published_at), tagName: tag.tag_name,
                                scoreIndex: this.rateVersionBasedOnIndex(i,formulas.power_function),
                                scoreRelease: this.rateVersionBasedOnRelease(difference, formulas.power_function)};
                            
                            this.listOfVersionsBuffer.set(tag.tag_name, curr);
                            prev=curr;
                            i++;
                    })
                    this.updateListOfVersions(pageNumber + 1, i, prev);
                    
                } else {

                    this.listOfVersions = this.listOfVersionsBuffer;
                    //console.log(this.listOfVersions);
                    
                    //setTimeout(() => this.checkForUpdate(evntEmi), 10 * 1000);

                }
            } else {
                console.log("Could not update the list. Status of request: " + res.status);
            }

        }).catch((err) => {
            console.log("Could not update the list " + err.message);

        });
    }

    setHoursTilNextUpdate(hours: number){
        this.HOURS_UNTIL_NEXT_UPDATE = hours;
        return this;
    }

    setABCPower(a?: number, b?: number, c?: number){
        if(a) this.a1 = a;
        if(b) this.b1 = b;
        if(c) this.c1 = c;
        return this;
    }

    setABSQuadr(a?: number, b?: number, c?: number){
        if(a) this.a_quadr = a;
        if(b) this.b_quadr = b;
        if(c) this.c_quadr = c;
        return this;
    }

    setWeeksGracePeriod(weeks: number){
        this.weeks_grace_period = weeks;
        return this;
    }

    setPortsGraceNumber(ports: number){
        this.ports_grace_number = ports;
        return this;
    }

    setCutoff(cutoff: number){
        this.cutoff = cutoff;
        return this;
    }

    setRoundToDecimals(decimals: number){
        this.decimal_to_round_to = decimals;
        return this;
    }

    setVersionMap(mapIn : Map<string, VersionInfo>){
        this.listOfVersions = mapIn;
        return this;
    }

    setVerboseLevel(verbosity: number){
        this.verboseLevel = verbosity;
        return this;
    }

}

// var test = new SecurityMetric();
// test.start();
// console.log(test.getRating('1.7.2'));
// console.log(test.getRating('1.7.0'));
// console.log(test.getRating('1.6.0'));
// console.log(test.getRating('1.5.1'));
// console.log(test.getRating('1.0.0'));
