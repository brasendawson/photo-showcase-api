import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  
  let customError = {
    // Set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || 'Something went wrong, please try again later'
  };

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = err.errors.map(item => item.message).join(', ');
  }

  // Handle unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = `${err.errors[0].path} must be unique`;
  }

  // Handle foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = 'The referenced record does not exist';
  }

  return res.status(customError.statusCode).json({ 
    success: false, 
    message: customError.message 
  });
};

export default errorHandlerMiddleware;
