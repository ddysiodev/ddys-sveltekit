export class DdysError extends Error {
  readonly status: number;
  readonly method: string;
  readonly path: string;
  readonly cause?: unknown;

  constructor(message: string, status = 500, method = 'GET', path = '', cause?: unknown) {
    super(message);
    this.name = 'DdysError';
    this.status = status;
    this.method = method;
    this.path = path;
    this.cause = cause;
  }
}
