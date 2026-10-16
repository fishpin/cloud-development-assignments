// DynamoDB is an external service, so it is mocked: the tests run without LocalStack
const mockSend = jest.fn();

jest.mock("@aws-sdk/client-dynamodb", () => ({
    DynamoDBClient: jest.fn()
}));

jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocumentClient: {
        from: jest.fn(() => ({ send: mockSend }))
    },
    GetCommand: jest.fn((input) => ({ input }))
}));

const lambda = require("./index");

const coupon = {
    id: "C001",
    provider_id: "P100",
    campaign_id: "CAMP01",
    code: "WELCOME10",
    description: "10% off your first order",
    discount: 10,
    expiry_date: "2026-12-31"
};

beforeEach(() => {
    mockSend.mockReset();
});


test("Validate coupon is returned when found", async () => {

    mockSend.mockResolvedValue({ Item: coupon });

    const event = {
        pathParameters: { id: "C001" }
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(coupon);

});


test("Validate path parameter id is used as the key", async () => {

    mockSend.mockResolvedValue({ Item: coupon });

    const event = {
        pathParameters: { id: "C001" }
    };

    await lambda.handler(event);

    expect(mockSend.mock.calls[0][0].input).toEqual({
        TableName: "coupons",
        Key: { id: "C001" }
    });

});


test("Validate 404 when coupon is not found", async () => {

    mockSend.mockResolvedValue({});

    const event = {
        pathParameters: { id: "C999" }
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe("Coupon not found");

});


test("Validate 500 when the database call fails", async () => {

    mockSend.mockRejectedValue(new Error("DynamoDB unavailable"));

    const event = {
        pathParameters: { id: "C001" }
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe("DynamoDB unavailable");

});
