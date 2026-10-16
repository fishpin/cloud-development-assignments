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

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const lambda = require("./index");

const secret = "0HXc4w5NEzA61HkV";
const user = {
    username: "admin",
    password: bcrypt.hashSync("password123", 12)
};

beforeEach(() => {
    mockSend.mockReset();
});


test("Validate token and expiration returned for valid credentials", async () => {

    mockSend.mockResolvedValue({ Item: user });

    const event = {
        body: JSON.stringify({ username: "admin", password: "password123" })
    };

    const response = await lambda.handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(jwt.verify(body.token, secret).username).toBe("admin");
    expect(new Date(body.expiration).getTime()).toBeGreaterThan(Date.now());

});


test("Validate user is looked up in the users table", async () => {

    mockSend.mockResolvedValue({ Item: user });

    const event = {
        body: JSON.stringify({ username: "admin", password: "password123" })
    };

    await lambda.handler(event);

    expect(mockSend.mock.calls[0][0].input).toEqual({
        TableName: "users",
        Key: { username: "admin" }
    });

});


test("Validate 403 for invalid username", async () => {

    mockSend.mockResolvedValue({});

    const event = {
        body: JSON.stringify({ username: "nobody", password: "password123" })
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);

});


test("Validate 403 for invalid password", async () => {

    mockSend.mockResolvedValue({ Item: user });

    const event = {
        body: JSON.stringify({ username: "admin", password: "wrongpassword" })
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);

});


test("Validate 403 when credentials are missing", async () => {

    const event = {
        body: null
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);
    expect(mockSend).not.toHaveBeenCalled();

});
