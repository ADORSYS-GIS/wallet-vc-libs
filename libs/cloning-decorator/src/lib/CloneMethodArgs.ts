/* eslint-disable @typescript-eslint/no-explicit-any */

export type CloneMethodArgsOptions = {
  // Do not clone args that are instances
  // of the types specified in this option
  exclude?: any[];
};

/**
 * A decorator to clone all arguments passed to the methods
 * of the decorated class, including its constructor.
 */
export function CloneMethodArgs(opts?: CloneMethodArgsOptions) {
  return function <T>(target: T): T {
    const original: any = target;

    // Decorate constructor
    const decorated = function (...args: unknown[]) {
      // Deep clone arguments
      const clonedArgs = cloneArgs(args, opts?.exclude);

      // Call the original constructor with the cloned arguments
      return new original(...clonedArgs);
    };

    // Copy prototype so intanceof operator still works
    decorated.prototype = original.prototype;

    // Iterate over the properties of the prototype
    Object.getOwnPropertyNames(decorated.prototype)
      .filter((property) => property != 'constructor')
      .forEach((property) => {
        // Read property's descriptor
        const descriptor = Object.getOwnPropertyDescriptor(
          decorated.prototype,
          property
        );

        // Filter methods
        if (descriptor && typeof descriptor.value === 'function') {
          // Stash original method's definition
          const originalMethod = descriptor.value;

          // Override the method with interception and cloning behavior
          decorated.prototype[property] = function (
            this: unknown,
            ...args: unknown[]
          ) {
            // Deep clone arguments
            const clonedArgs = cloneArgs(args, opts?.exclude);

            // Call the original method with the cloned arguments
            return originalMethod.apply(this, clonedArgs);
          };
        }
      });

    // Override original constructor
    return decorated as T;
  };
}

/**
 * Utility to clone args of types not explicitly excluded.
 */
const cloneArgs = (args: unknown[], exclude: any[] = []): unknown[] => {
  return args.map((arg) =>
    exclude.some((t) => arg instanceof t) ? arg : structuredClone(arg)
  );
};
