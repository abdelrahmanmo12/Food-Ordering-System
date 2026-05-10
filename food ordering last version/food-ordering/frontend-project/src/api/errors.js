export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function toApiError(err) {
  if (err instanceof ApiError) return err;
  if (err && typeof err === "object") {
    const message = err.message || "Unexpected error";
    const status = err.status || err.statusCode;
    return new ApiError(message, { status, details: err });
  }
  return new ApiError("Unexpected error", { details: err });
}

