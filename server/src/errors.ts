import type { ApiErrorBody } from '../../shared/index.ts';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  constructor(code: string, message: string, status = 400, retryable = false) {
    super(message); this.code = code; this.status = status; this.retryable = retryable;
  }
  body(): ApiErrorBody { return { code: this.code, message: this.message, retryable: this.retryable }; }
}
