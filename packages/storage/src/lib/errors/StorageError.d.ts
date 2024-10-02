import { MethodNames } from '../types';
/**
 * Storage Error class
 */
export declare class StorageError extends Error {
  /**
   * Storage Error class constructor
   * @param message The error message
   * @param context The name of the method where the error was thrown
   */
  constructor(message: string, context?: MethodNames);
}
