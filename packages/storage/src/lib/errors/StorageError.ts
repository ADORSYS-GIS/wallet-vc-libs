import { MethodNames } from '../types';

/**
 * Storage Error class
 */
export class StorageError extends Error {
  /**
   * Storage Error class constructor
   * @param message The error message
   * @param context The name of the method where the error was thrown
   */
  constructor(message: string, context?: MethodNames) {
    const errorMessage = `StorageError: ${message}`;
    if (context)
      console.log(`Error occurred in method <${context}>\n ${errorMessage}`);

    super(errorMessage);
    this.name = `StorageError`;
  }
}