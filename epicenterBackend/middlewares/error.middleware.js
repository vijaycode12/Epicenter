export const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Route not found - ${req.originalUrl}`));
};

const errorMiddlware = (err,req,res,next) =>{
    try{
        let error = {...err};
        error.message = err.message;
        console.log(err);

        if(err.name === "CastError"){
            const message = "Resource not found";
            error = new Error(message);
            error.statusCode = 404;
        }

        if(err.code === 11000){
            const message = "Duplicate key found";
            error = new Error(message);
            error.statusCode = 400;
        }

        if(err.name === "ValidationError"){
            const message = Object.values(err.errors).map(val=>val.message);
            error = new Error(message);
            error.statusCode=400;
        }

        res.status(error.statusCode||500).json({success:false,error:error.message || "Server error"});
    }catch(error){
        next(error);
    }
};

export default errorMiddlware;