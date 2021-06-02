import ValidatorIdentifier from './validators'


test("test validator identifier: empty constructor", () => {

    let valIden = new ValidatorIdentifier();

    expect(valIden).toBeTruthy();
    expect(valIden.validatorBatchCount).toBeUndefined();

})