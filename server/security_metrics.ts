import axios from "axios";

const HOURS_UNTIL_NEXT_UPDATE: number = 2;
const a: number = 0.6;
const b: number = 1.1;
const c: number = -0.6;

export default class SecurityMetric {
    listOfVersions: Map<string, number>;
    listOfVersionsBuffer: Map<string, number>;
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
    rateVersion(version: string):number {
        if(this.listOfVersions.has(version)){
            var index = this.listOfVersions.get(version);
            return index == undefined ? -1000 : Math.max(-1000, 100-100*(a*(Math.pow(b,index))+c))
        }else{
            return -1000;
        }
    }
    checkForUpdate() {
        axios.get(`https://api.github.com/repos/ripple/rippled/tags`,
            { timeout: 6000, params: { page: 1 } }
        ).then((res) => {

            if (res.status == 200) {
                if (res.data && res.data.length > 0) {

                    if (this.listOfVersions.has(res.data[0].name) && this.listOfVersions.get(res.data[0].name) == 0) {
                        console.log("No update needed");
                        setTimeout(() => this.checkForUpdate(), 10 * 1000);
                        return;
                    } else {
                        console.log("update needed "+res.data[0].name + " had index "+this.listOfVersions.get(res.data[0]))
                        var i = 0;
                        this.listOfVersionsBuffer.clear();
                        res.data.map((tag: any) => {
                            console.log(tag.name,i)
                            this.listOfVersionsBuffer.set(tag.name, i);
                            i++;
                        })
                        this.updateListOfVersions(2, i);
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
    updateListOfVersions(pageNumber: number, i: number) {

        axios.get(`https://api.github.com/repos/ripple/rippled/tags`,
            { timeout: 6000, params: { page: pageNumber } }
        ).then((res) => {

            if (res.status == 200) {
                if (res.data && res.data.length > 0) {

                    res.data.map((tag: any) => {
                        console.log(tag.name,i)
                        this.listOfVersionsBuffer.set(tag.name, i);
                        i++;
                    })
                    this.updateListOfVersions(pageNumber + 1, i);
                    
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
console.log(test.rateVersion('1.7.2'));
console.log(test.rateVersion('1.7.0'));
console.log(test.rateVersion('1.6.0'));
console.log(test.rateVersion('1.5.1'));
console.log(test.rateVersion('1.0.0'));
