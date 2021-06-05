var fitForThese = [100,82,48,24,0,-20,-30, -50];
var min_total = 100000;
var x=0;
var y=0;
var z=0;
for(var a = -5; a<5; a=Math.round((a+0.005 + Number.EPSILON) * 1000) / 1000){
    for(var b = -5; b<5; b=Math.round((b+0.005 + Number.EPSILON) * 1000) / 1000){
        var c = 1;
        var difference_max = -10000;
        var total_difference = 0;
        var sum = 0;
        for(var i =0; i< fitForThese.length;i++){
            var diff = Math.abs(fitForThese[i]-(100*(a*(i*i)+b*i+c)))
            if(diff>difference_max) difference_max=diff;
            sum+=diff;
        }
        if(sum<min_total){
            min_total=sum;
            x=a;
            y=b;
            z = difference_max;
        }
    }
}
console.log(x+" "+y+" "+min_total+" "+z)

min_total=10000;
for(var a = -5; a<5; a=Math.round((a+0.005 + Number.EPSILON) * 1000) / 1000){
    for(var b = -5; b<5; b=Math.round((b+0.005 + Number.EPSILON) * 1000) / 1000){
        var c = -a;
        var difference_max = -10000;
        var total_difference = 0;
        var sum = 0;
        for(var i =0; i< fitForThese.length;i++){
            var diff = Math.abs(fitForThese[i]-(100-100*(a*(Math.pow(b,i))+c)))
            if(diff>difference_max) difference_max=diff;
            sum+=diff;
        }
        if(sum<min_total){
            min_total=sum;
            x=a;
            y=b;
            z = difference_max;
        }
    }
}
console.log(x+" "+y+" "+min_total+" "+z)