export class HttpException extends Error {
    statusCode?: number;
    message: string;
    errorMessage: string | string[];
    subStatusCode?: number;
  
    constructor(statusCode: number, messages: string | string[], subStatusCode?: number) {
      super(typeof messages === 'string' ? messages : messages[0]);
      this.statusCode = statusCode || 500;
      this.message = typeof messages === 'string' ? messages : messages[0];
      this.errorMessage = messages;
      this.subStatusCode = subStatusCode;
    }
  }