const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({
    region:"us-east-1",
    endpoint:"http://host.docker.internal:4566"
});

const dynamodb = DynamoDBDocumentClient.from(client);
const tableName="coupons";

exports.handler = async(event)=>{
    const couponID = event.pathParameters.id;
    try{
        const result = await dynamodb.send(
            new GetCommand({
                TableName: tableName,
                Key:{
                    id: couponID
                }
            })
        );
        if(!result.Item){

            return {
                statusCode:404,
                body:"Coupon not found"
            };

        }
        return {

            statusCode:200,

            body:JSON.stringify(result.Item)

        };

    }catch(error){

        return {

            statusCode:500,

            body:error.message

        };
    }
};
