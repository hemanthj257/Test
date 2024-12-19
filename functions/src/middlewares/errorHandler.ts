import express, { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/exception';

export const errorHandler = (app: express.Application): void => {
  app.use((err: Error | HttpException, _req: Request, res: Response, next: NextFunction) => {
    // Check if the error is an instance of HttpException
    if (err instanceof HttpException) {
      return res.status(err.statusCode || 500).json({
        message: err.message,
        statusCode: err.statusCode,
        errorMessage: err.errorMessage,
        subStatusCode: err.subStatusCode
      });
    }

    // Handle other errors
    return res.status(500).json({
      message: err.message || 'Internal Server Error',
      statusCode: 500
    });
  });
};
