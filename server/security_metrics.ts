import axios from "axios";
import * as formulas from "./formulas"
const HOURS_UNTIL_NEXT_UPDATE: number = 2;
const a: number = 0.6;
const b: number = 1.1;
const c: number = -0.6;

const a1: number = 1.1;
const b1: number = 1.05;
const c1: number = -1.1;
interface VersionInfo{
    index: number;
    tagName: string;
    publishDate: Date;
    scoreRelease : number;
    scoreIndex: number;
}
export default class SecurityMetric {
    listOfVersions: Map<string, VersionInfo>;
    listOfVersionsBuffer: Map<string, VersionInfo>;
    constructor() {
        this.listOfVersionsBuffer = new Map();
        this.listOfVersions = new Map();
        // this.listOfVersions.set('1.7.2',0);
        // this.listOfVersions.set('1.7.0',1);
        // this.listOfVersions.set('1.6.0',2);
        // this.listOfVersions.set('1.5.1',3);
        // this.listOfVersions.set('1.5.0',4);
    }
    start() {
        try {
            this.checkForUpdate();
        } catch (err) {
            console.log("Could not update the list " + err.message)
        }
    }

    rateVersionBasedOnRelease(difference: number, evalFunction:(x:number)=>number): number {
        if(difference>=0){
            return evalFunction(difference)
            //return index == undefined ? -1000 : Math.max(-1000, 100-100*(a*(Math.pow(b,index.index))+c))
        }else{
            return -1000;
        }
        
    }
    getRating(version: string){
        var v = this.listOfVersions.get(version);
        return v==undefined ? -1000 : (v.scoreIndex, v.scoreRelease)
    }
    rateVersionBasedOnIndex(index:number, evalFunction: (x:number, a?: number, b?: number, c?: number, cutoff?: number, decimals?: number)=>number):number {
        return evalFunction(index,a,b,c,-1000,2);
    }

    //Rate Limit 60 requests per hour so be careful!
    checkForUpdate() {
        axios.get(`https://api.github.com/repos/ripple/rippled/releases`,
            { timeout: 6000, params: { page: 1 } }
        ).then((res) => {

            if (res.status == 200) {
                if (res.data && res.data.length > 0) {

                    if (this.listOfVersions && this.listOfVersions.has(res.data[0].tag_name) && this.listOfVersions.get(res.data[0].tag_name)?.index==0) {

                        console.log("No update needed");
                        setTimeout(() => this.checkForUpdate(), HOURS_UNTIL_NEXT_UPDATE*60*60 * 1000);
                        return;
                    } else {

                        console.log("update needed "+res.data[0].tag_name + " had index "+this.listOfVersions.get(res.data[0]))
                        var i = 0;
                        this.listOfVersionsBuffer.clear();
                        var prev: VersionInfo | undefined = undefined;
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
                        //this.updateListOfVersions(2, i, prev);
                        this.listOfVersions = this.listOfVersionsBuffer;
                        
                        setTimeout(() => this.checkForUpdate(), HOURS_UNTIL_NEXT_UPDATE*60*60 * 1000);

                        return;
                    }

                } else {
                    console.log("Could not update the list. No data");
                }
            } else {
                console.log("Could not update the list. Status of request: " + res.status);
            }


        }).catch((err) => {
            console.log("Could not update the list " + err.message);
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
                    console.log(this.listOfVersions);
                    // this.listOfVersions.map((inp) => console.log(inp))
                    setTimeout(() => this.checkForUpdate(), 10 * 1000);

                }
            } else {
                console.log("Could not update the list. Status of request: " + res.status);
            }

        }).catch((err) => {
            console.log("Could not update the list " + err.message);

        });
    }



}

var test = new SecurityMetric();
test.start();
// console.log(test.rateVersionBasedOnIndex('1.7.2'));
// console.log(test.rateVersionBasedOnIndex('1.7.0'));
// console.log(test.rateVersionBasedOnIndex('1.6.0'));
// console.log(test.rateVersionBasedOnIndex('1.5.1'));
// console.log(test.rateVersionBasedOnIndex('1.0.0'));
