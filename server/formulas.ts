const def_a: number = 1.1;
const def_b: number = 1.05;
const def_c: number = -1.1;
const def_cutoff: number = -1000;
const def_decimals: number = 2;

export function power_function(x: number, a?: number, b?: number, c?: number, cutoff?: number, decimals?: number){
    if(cutoff==undefined) cutoff=def_cutoff;
    if(a==undefined) a=def_a;
    if(b==undefined) b=def_b;
    if(c==undefined) c=def_c;
    if(decimals==undefined) decimals=def_decimals;
    
    return Math.max(cutoff,round_to_decimals(100-100*(a*(Math.pow(b,x))+c), decimals)) 
}



export function quadratic_function(x: number, a?: number, b?: number, c?: number, cutoff?: number, decimals?: number){
    if(cutoff==undefined) cutoff=def_cutoff;
    if(a==undefined) a=-0.005;
    if(b==undefined) b=-0.2;
    if(c==undefined) c=1;
    if(decimals==undefined) decimals=def_decimals;
    
    return Math.max(cutoff,100*((a*(x*x))+b*x+c));
}
export function round_to_decimals(x: number, decimals: number){
    return Math.round((x+Number.EPSILON)*Math.pow(10,decimals))/Math.pow(10,decimals)
} 

// console.log(round_to_decimals(4.14141,1));
// console.log(round_to_decimals(4525.1,4));
// console.log(round_to_decimals(6262.00414141,3));
// console.log(power_function(0));
// console.log(quadratic_function(10));
// console.log(quadratic_function(20));
