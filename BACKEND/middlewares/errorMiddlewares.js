class errorHandler extends Error{
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if(err.code === 11000){
    const statusCode = 400;
    const message = `Duplicate field value entered`;
    err = new errorHandler(message, statusCode);
  }

  
  if(err.name === "JsonWebTokenError"){
    const statusCode = 400;
    const message = `Json Web Token is invalid, try again`;
    err = new errorHandler(message, statusCode);
  }

  if(err.name === "TokenExpiredError"){
    const statusCode = 400;
    const message = `Json Web Token is expired, try again`;
    err = new errorHandler(message, statusCode);
  }

  if(err.name === "CastError"){
    const statusCode = 400;
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new errorHandler(message, statusCode);
  }

  const errorMessage = err.errors?
  Object.values(err.errors).map(error => error.message).join(" ") : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage
  });
};

export default errorHandler