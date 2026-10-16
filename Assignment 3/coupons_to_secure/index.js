const jwt = require("jsonwebtoken");

const secret = "0HXc4w5NEzA61HkV";

exports.handler = async(event)=>{

    const headers = event.headers || {};
    const authHeader = headers.Authorization || headers.authorization || "";

    const token = authHeader.replace("Bearer ","");

    try{

        const data = jwt.verify(
            token,
            secret
        );

        return {
            statusCode:200,
            body:JSON.stringify({
                data:{
                    message:"Protected data",
                    user:data.username
                },
                token:"Token valid"
            })
        };

    }catch(error){

        return {
            statusCode:403,
            body:JSON.stringify({
                message:"Invalid token"
            })
        };
    }
};
