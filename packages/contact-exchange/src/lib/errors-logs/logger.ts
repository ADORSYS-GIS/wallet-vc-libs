export interface LogErrorDetails {
  name: string;
  message: string;
  stack?: string;
  context?: string;
}

export function logError(error: Error, context: string): void {
  const errorDetails: LogErrorDetails = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
  };
}
