export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();

    // Set the prototype explicitly to maintain the instance of Error
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture the stack trace for debugging
    Error.captureStackTrace(this);
  }
}


// Not Found Error

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, true, details);
    this.name = 'NotFoundError';
  }
}

// Bad Request Error

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, true, details);
    this.name = 'BadRequestError';
  }
}

// Unauthorized Error

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, true, details);
    this.name = 'UnauthorizedError';
  }
}

// Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, true, details);
    this.name = 'ForbiddenError';
  }
}

// Internal Server Error
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, false, details);
    this.name = 'InternalServerError';
  }
}

// Rate Limit Exceeded Error

export class RateLimitError extends AppError {
    constructor(message:string = 'Too many requests, please try again later.', details?: any) {
        super(message, 429, true, details);
        this.name = 'RateLimitError';
    }
}


// validation Error (use for joi/zod/react-hook-form validation errors)

// export class ValidationError extends AppError {
//   constructor(message: string = 'Invalid request data.', details?: any) {
//     super(message, 422, true, details);
//     this.name = 'ValidationError';
//   }
// }