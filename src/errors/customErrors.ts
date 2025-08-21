export class NotFoundError extends Error {
          status: number;
        
          constructor(message: string) {
            super(message);
            this.name = "NotFoundError";
            this.status = 404;
          }
        }
        
        export class ValidationError extends Error {
          status: number;
          errors: any;
        
          constructor(message: string, errors: any) {
            super(message);
            this.name = "ValidationError";
            this.status = 400;
            this.errors = errors;
          }
        }