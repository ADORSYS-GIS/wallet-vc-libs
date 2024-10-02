'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.StorageError = void 0;
/**
 * Storage Error class
 */
class StorageError extends Error {
  /**
   * Storage Error class constructor
   * @param message The error message
   * @param context The name of the method where the error was thrown
   */
  constructor(message, context) {
    const errorMessage = `StorageError: ${message}`;
    if (context)
      console.log(`Error occurred in method <${context}>\n ${errorMessage}`);
    super(errorMessage);
    this.name = `StorageError`;
  }
}
exports.StorageError = StorageError;
//# sourceMappingURL=StorageError.js.map
