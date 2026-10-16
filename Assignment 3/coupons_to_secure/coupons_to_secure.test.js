const jwt = require("jsonwebtoken");
const lambda = require("./index");

const secret = "0HXc4w5NEzA61HkV";


test("Validate 200 with a valid token", async () => {

    const token = jwt.sign({ username: "admin" }, secret, { expiresIn: "1h" });

    const event = {
        headers: { Authorization: "Bearer " + token }
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).data.user).toBe("admin");

});


test("Validate 403 with an invalid token", async () => {

    const event = {
        headers: { Authorization: "Bearer badtoken" }
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);

});


test("Validate 403 with a token signed by a different secret", async () => {

    const token = jwt.sign({ username: "admin" }, "wrongsecret", { expiresIn: "1h" });

    const event = {
        headers: { Authorization: "Bearer " + token }
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);

});


test("Validate 403 with an expired token", async () => {

    const token = jwt.sign({ username: "admin" }, secret, { expiresIn: "-1s" });

    const event = {
        headers: { Authorization: "Bearer " + token }
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);

});


test("Validate 403 when the token is missing", async () => {

    const event = {
        headers: {}
    };

    const response = await lambda.handler(event);

    expect(response.statusCode).toBe(403);

});
