const lambda = require("./index");

test("Validate status code", async () => {

    const event = {
        httpMethod: "GET",
        path: "/coupons_poc"
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(200);

});


test("Validate message output", async () => {

    const event = {
        httpMethod: "GET",
        path: "/coupons_poc"
    };

    const response = await lambda.handler(event);

    expect(response.body.message)
        .toBe("Coupons API is working successfully");

});
