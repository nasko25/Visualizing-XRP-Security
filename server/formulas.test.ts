import * as formulas from './formulas'

test("test decimal rounding function", () => {
    // test if round properly
  
    expect(formulas.round_to_decimals(4.242, 2)).toBe(4.24);
    expect(formulas.round_to_decimals(441, 2)).toBe(441);
    expect(formulas.round_to_decimals(74.5115, 3)).toBe(74.512);
    expect(formulas.round_to_decimals(511.4199, 3)).toBe(511.420);
    expect(formulas.round_to_decimals(0.391, 7)).toBe(0.391);
    expect(formulas.round_to_decimals(555.555, 0)).toBe(556);
    expect(formulas.round_to_decimals(555.555, 3)).toBe(555.555);
    expect(formulas.round_to_decimals(555.555,-2)).toBe(600);
    expect(formulas.round_to_decimals(555.555,-6)).toBe(0);
    expect(formulas.round_to_decimals(0.184919481999924, 1)).toBe(0.2);
});


test("test quadratic function", () => {
    // test if calculate quadratic properly
  
    expect(formulas.quadratic_function(0)).toBe(100);
    expect(formulas.quadratic_function(2)).toBe(58);
    expect(formulas.quadratic_function(4)).toBe(12);
    expect(formulas.quadratic_function(6.03)).toBe(-38.78);
    expect(formulas.quadratic_function(34)).toBe(-1000);
    expect(formulas.quadratic_function(3, 0.2, -1.2, 2, -10, 4)).toBe(20);
    expect(formulas.quadratic_function(0, 0.2, -1.2, 2, -10, 4)).toBe(200);
});


test("test power function", () => {
    // test if calculate power properly
  
    expect(formulas.power_function(0)).toBe(100);
    expect(formulas.power_function(2)).toBe(88.73);
    expect(formulas.power_function(4)).toBe(76.29);
    expect(formulas.power_function(6.032)).toBe(62.36);
    expect(formulas.power_function(13.2529)).toBe(0);
    expect(formulas.power_function(26.5)).toBe(-190.78);
    expect(formulas.power_function(37.13)).toBe(-463.21);
    expect(formulas.power_function(57)).toBe(-1000);
    expect(formulas.power_function(21, 0.2, -1.2, 2, -10, 4)).toBe(820.1024);
    expect(formulas.power_function(21, 0.2, -1.2, 2, -10, 6)).toBe(820.102398);
});