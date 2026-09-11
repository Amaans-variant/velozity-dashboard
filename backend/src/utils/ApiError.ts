// throw new ApiError(403, "nice try") anywhere and the error middleware
// will catch it and format it nice for the client. no stack traces leaking, promise
export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
