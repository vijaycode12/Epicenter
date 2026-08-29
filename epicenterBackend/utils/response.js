export const success = (res,statusCode = 200,message = "Success",data ={})=>{
    return res.status(statusCode).json({
        success:true,
        message,
        data,
    });
}

export const fail = (res,statusCode=500,message = "Something went wrong")=>{
    res.status(statusCode).json({
        success:false,
        message,
    });
}