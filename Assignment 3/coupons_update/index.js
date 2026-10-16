const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const jwt = require("jsonwebtoken");

const secret = "0HXc4w5NEzA61HkV";


const client = new DynamoDBClient({
    region:"us-east-1",
    endpoint:"http://host.docker.internal:4566"
});

const dynamodb=DynamoDBDocumentClient.from(client);
const tableName="coupons";
exports.handler=async(event)=>{
    const headers = event.headers || {};
    const authHeader = headers.Authorization || headers.authorization || "";
    const token = authHeader.replace("Bearer ","");

    try{
        jwt.verify(token, secret);
    }catch(error){
        return {
            statusCode:403,
            body:JSON.stringify({
                message:"Invalid token"
            })
        };
    }

    const couponID=event.pathParameters.id;
    const body=JSON.parse(event.body);

    try{
        await dynamodb.send(
            new UpdateCommand({
                TableName:tableName,

                Key:{
                    id:couponID
                },

                UpdateExpression:
                "set provider_id=:provider_id, campaign_id=:campaign_id, code=:code, #d=:description, discount=:discount, expiry_date=:expiry_date",


                ExpressionAttributeNames:{
                    "#d":"description"
                },

                ExpressionAttributeValues:{

                    ":provider_id":body.provider_id,

                    ":campaign_id":body.campaign_id,

                    ":code":body.code,

                    ":description":body.description,

                    ":discount":body.discount,

                    ":expiry_date":body.expiry_date

                }

            })

        );

        return {

            statusCode:200,

            body:JSON.stringify({
                message:"Coupon updated"
            })

        };

    }catch(error){
        return {

            statusCode:500,

            body:error.message

        };
    }
};
