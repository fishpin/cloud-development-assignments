// DynamoDB is an external service, so it is mocked: the tests run without LocalStack
const mockSend = jest.fn();

jest.mock("@aws-sdk/client-dynamodb", () => ({
    DynamoDBClient: jest.fn()
}));

jest.mock("@aws-sdk/lib-dynamodb", () => ({
    DynamoDBDocumentClient: {
        from: jest.fn(() => ({ send: mockSend }))
    },
    UpdateCommand: jest.fn((input) => ({ input }))
}));

const jwt = require("jsonwebtoken");
const lambda = require("./index");

const secret = "0HXc4w5NEzA61HkV";
const token = jwt.sign({ username: "admin" }, secret, { expiresIn: "1h" });

const body = JSON.stringify({
    provider_id: "P200",
    campaign_id: "CAMP01",
    code: "SUMMER30",
    description: "30% off summer collection",
    discount: 30,
    expiry_date: "2026-09-30"
});

beforeEach(() => {
    mockSend.mockReset();
});


test("Validate coupon is updated with a valid token", async () => {

    mockSend.mockResolvedValue({});

    const event = {
        headers: { Authorization: "Bearer " + token },
        pathParameters: { id: "C003" },
        body: body
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).message).toBe("Coupon updated");
    expect(mockSend.mock.calls[0][0].input.Key).toEqual({ id: "C003" });

});


test("Validate 403 when the token is missing", async () => {

    const event = {
        headers: {},
        pathParameters: { id: "C003" },
        body: body
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);
    expect(mockSend).not.toHaveBeenCalled();

});


test("Validate 403 when the token is invalid", async () => {

    const event = {
        headers: { Authorization: "Bearer badtoken" },
        pathParameters: { id: "C003" },
        body: body
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);
    expect(mockSend).not.toHaveBeenCalled();

});
