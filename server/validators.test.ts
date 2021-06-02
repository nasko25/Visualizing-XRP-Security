import ValidatorIdentifier from './validators'


test("test validator identifier: empty constructor", () => {

    let valIden : ValidatorIdentifier = new ValidatorIdentifier();

    expect(valIden).toBeTruthy();
    expect(valIden.validatorBatchCount).toEqual(10);

})

test("test validator identifier: constructor with number", () => {

    let number = 100;

    let valIden : ValidatorIdentifier = new ValidatorIdentifier(number);

    expect(valIden.validatorBatchCount).toEqual(number);


})