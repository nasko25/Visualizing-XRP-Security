import axios from "axios";

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
}
export default class SecurityMetric {
    listOfVersions: Map<string, VersionInfo>;
    listOfVersionsBuffer: Map<string, VersionInfo>;
    arrayOfVersions: string[];
    arrayOfVersionBuffer: string[];
    constructor() {
        this.listOfVersionsBuffer = new Map();
        this.listOfVersions = new Map();
        this.arrayOfVersions = [];
        this.arrayOfVersionBuffer = [];
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

    rateVersionBasedOnRelease(version: string): number {
  
        var index = this.listOfVersions.get(version);
        if(index!=undefined){
            if(index.index == 0) return 100;
            var nextReleaseDate: Date | undefined= this.listOfVersions.get(this.arrayOfVersions[index.index-1])?.publishDate;
            if(nextReleaseDate==undefined) throw new Error("Unknown error occured");

            var difference = Math.max((((new Date()).getTime()-nextReleaseDate.getTime())/(7*1000*60*60*24))-2, 0);
            return Math.round((Math.max(-1000, 100-100*(a1*(Math.pow(b1,difference))+c1)) + Number.EPSILON) * 1000) / 1000
            //return index == undefined ? -1000 : Math.max(-1000, 100-100*(a*(Math.pow(b,index.index))+c))
        }else{
            return -1000;
        }
        
    }

    rateVersionBasedOnIndex(version: string):number {
        if(this.listOfVersions.has(version)){
            var index = this.listOfVersions.get(version);
            return index == undefined ? -1000 :  Math.round((Math.max(-1000, 100-100*(a*(Math.pow(b,index.index))+c)) + Number.EPSILON) * 1000) / 1000
           
        }else{
            return -1000;
        }
    }
    //Rate Limit 60 requests per hour so be careful!
    checkForUpdate() {
        axios.get(`https://api.github.com/repos/ripple/rippled/releases`,
            { timeout: 6000, params: { page: 1 } }
        ).then((res) => {

            if (res.status == 200) {
                if (res.data && res.data.length > 0) {

                    if (this,this.arrayOfVersions.length>0 && this.arrayOfVersions[0]==res.data[0].tag_name) {
                        console.log("No update needed");
                        setTimeout(() => this.checkForUpdate(), HOURS_UNTIL_NEXT_UPDATE*60*60 * 1000);
                        return;
                    } else {
                        console.log("update needed "+res.data[0].tag_name + " had index "+this.listOfVersions.get(res.data[0]))
                        var i = 0;
                        this.listOfVersionsBuffer.clear();
                        res.data.map((tag: any) => {
                            console.log(tag.tag_name,i)
                            this.arrayOfVersionBuffer.push(tag.tag_name);
                            this.listOfVersionsBuffer.set(tag.tag_name, {index: i, publishDate: new Date(tag.published_at), tagName: tag.tag_name});
                            i++;
                        })
                        //this.updateListOfVersions(2, i);
                        this.listOfVersions = this.listOfVersionsBuffer;
                        this.arrayOfVersions = this.arrayOfVersionBuffer;
                        
                        console.log(this.listOfVersions);
                    
                       // Test stuff: 
                        // for(var index in this.arrayOfVersions){
                        //     console.log(this.rateVersionBasedOnRelease(this.arrayOfVersions[index]) + " other metric for "+this.arrayOfVersions[index]+" "+ this.rateVersionBasedOnIndex(this.arrayOfVersions[index]))
                        //     console.log(index);
                        // }
                 
                        // console.log(this.rateVersionBasedOnIndex('1.0.0av'));
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
    // updateListOfVersions(pageNumber: number, i: number) {

    //     axios.get(`https://api.github.com/repos/ripple/rippled/tags`,
    //         { timeout: 6000, params: { page: pageNumber } }
    //     ).then((res) => {

    //         if (res.status == 200) {
    //             if (res.data && res.data.length > 0) {

    //                 res.data.map((tag: any) => {
    //                     console.log(tag.name,i)
    //                     this.listOfVersionsBuffer.set(tag.name, i);
    //                     i++;
    //                 })
    //                 this.updateListOfVersions(pageNumber + 1, i);
                    
    //             } else {

    //                 this.listOfVersions = this.listOfVersionsBuffer;
    //                 console.log(this.listOfVersions);
    //                 // this.listOfVersions.map((inp) => console.log(inp))
    //                 setTimeout(() => this.checkForUpdate(), 10 * 1000);

    //             }
    //         } else {
    //             console.log("Could not update the list. Status of request: " + res.status);
    //         }

    //     }).catch((err) => {
    //         console.log("Could not update the list " + err.message);

    //     });
    // }



}

var test = new SecurityMetric();
test.start();
// console.log(test.rateVersionBasedOnIndex('1.7.2'));
// console.log(test.rateVersionBasedOnIndex('1.7.0'));
// console.log(test.rateVersionBasedOnIndex('1.6.0'));
// console.log(test.rateVersionBasedOnIndex('1.5.1'));
// console.log(test.rateVersionBasedOnIndex('1.0.0'));
