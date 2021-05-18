import axios from 'axios';
import config from './config/config.json';


var testData: string[] = ['91.12.98.74', '209.195.2.50', '194.35.86.10']

class GeoLocate{
    IPList: string[];

    constructor(IPs?: string[]){
        // if the IPs argument is provided, use the given IPs to get their geoloaction,
        // but if no IPs are provided, get the geolocation of nodes whose geolocation we don't yet know
        this.IPList = IPs || this.getIPsFromDB();
    }

    setIPList(newList: string[]){
        this.IPList = newList;
    }

    // helper function that gets the IP addresses of nodes that do not have a geolocation yet
    getIPsFromDB(): string[] {
        return [];
    }

    async wait(seconds: number){

        return new Promise(resolve => setTimeout(resolve, seconds*1000));
    }

    async getData(ip: string) {
        //access key needed for ipstack api
        const accessKey: string = config.accessKey;
        try {
           let response = await axios({
                url: 'http://api.ipstack.com/' + ip + '?access_key=' + accessKey,
                method: 'get',
                timeout: 8000
            })
            if(response.status == 200){
                return [response.data.latitude, response.data.longitude];
            }     
            throw new Error('response was not 200');    //sad moments here
        }catch (err) {
            throw new Error(err);
        }
    }
    //Recursively call from callback. This is probably forbidden by the Geneva Convention, but no other way to do it.
    locateHelper(curr: number){
        if(curr >= this.IPList.length){
            return;
        }
        this.getData(this.IPList[curr]).then(res => {
            console.log(res);
            //Delay requests by 1 second, so to not get blocked by the API
        
            this.wait(1).then((res) => this.locateHelper(curr+1)); 
        })
    }

    locate(){
        if(this.IPList == null || this.IPList.length == 0){
            return;
        }
        
        try{
            this.locateHelper(0);
        } catch(e){
            console.log(e);
        }
    }

}

export default GeoLocate;
export { testData };
