class AppError extends Error{ 
  statusCode:number;
  status:string;
  isOperational:boolean;

  constructor(message: string, statusCode: number) {
    super(message);//super(message) === new Error(message) => call Base-Class constructor
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // To mark errors that I handle, so if error (isOperational = false) so that error not handled by me 

    Error.captureStackTrace(this, this.constructor);//Remove some error details that not benefit
  }
} 

export { AppError };

