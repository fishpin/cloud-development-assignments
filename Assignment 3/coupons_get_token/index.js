const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
    region:"us-east-1",
    endpoint:"http://host.docker.internal:4566"
});

const dynamodb = DynamoDBDocumentClient.from(client);
const tableName = "users";

// save the secret in env
const secret = "0HXc4w5NEzA61HkV";

exports.handler = async(event)=>{

    const body = JSON.parse(event.body || "{}");
    const inputUsername = body.username;
    const inputPassword = body.password;

    if(!inputUsername || !inputPassword){

        return {
            statusCode:403,
            body:JSON.stringify({
                message:"Invalid username or password"
            })
        };
    }

    try{

        const result = await dynamodb.send(
            new GetCommand({
                TableName: tableName,
                Key:{
                    username: inputUsername
                }
            })
        );

        if(!result.Item){

            return {
                statusCode:403,
                body:JSON.stringify({
                    message:"Invalid username or password"
                })
            };
        }

        const valid = await bcrypt.compare(
            inputPassword,
            result.Item.password
        );

        if(!valid){

            return {
                statusCode:403,
                body:JSON.stringify({
                    message:"Invalid username or password"
                })
            };
        }

        const token = jwt.sign(
            {
                username: inputUsername
            },
            secret,
            {
                expiresIn:"1h"
            }
        );

        const expiration = new Date(jwt.decode(token).exp * 1000).toISOString();

        return {

            statusCode:200,

            body:JSON.stringify({
                token:token,
                expiration:expiration
            })
        };

    }catch(error){

        return {
            statusCode:500,
            body:error.message
        };
    }
};
