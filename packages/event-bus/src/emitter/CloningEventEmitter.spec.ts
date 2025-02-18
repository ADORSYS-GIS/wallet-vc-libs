import type { EventEmitter } from 'eventemitter3';
import { CloningEventEmitter } from './CloningEventEmitter';

describe('CloningEventEmitter', () => {
  let emitter: CloningEventEmitter;

  beforeEach(() => {
    emitter = new CloningEventEmitter();
  });

  it('should preserve the value of emitted data (primitives)', async () => {
    // Test data
    const entries = [5, 'hello', true, null, undefined];

    // Verify that the emitted data is equal to the original test data
    for (const sent of entries) {
      expect(await testEmit(emitter, sent)).toEqual(sent);
    }
  });

  it('should preserve the value of emitted data (objects)', async () => {
    // Test data
    const entries = [
      {},
      { a: 1, b: 2 },
      { a: 1, c: { b: 2 } },
      [],
      [1, 2, '3'],
      [1, 2, { a: 1, b: 2 }],
      { a: [1, 2, '3'] },
    ];

    // Verify that the emitted data is equal to the original test data
    for (const sent of entries) {
      expect(await testEmit(emitter, sent)).toEqual(sent);
    }
  });

  it('should deep clone objects', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sent: any, received: any;

    // Case 1
    sent = { a: 1, b: 2 };
    received = await testEmit(emitter, sent);
    expect(received).toEqual(sent);
    expect(received).not.toBe(sent);

    // Case 2
    sent = { a: 1, c: { b: 2 } };
    received = await testEmit(emitter, sent);
    expect(received).toEqual(sent);
    expect(received).not.toBe(sent);
    expect(received.c).not.toBe(sent.c);

    // Case 3
    sent = [1, 2, 3];
    received = await testEmit(emitter, sent);
    expect(received).toEqual(sent);
    expect(received).not.toBe(sent);

    // Case 4
    sent = { a: new Date(1619856000000) };
    received = await testEmit(emitter, sent);
    expect(received).toEqual(sent);
    expect(received).not.toBe(sent);
    expect(received.a).not.toBe(sent.a);
    expect(typeof received.a.getDate).toBe('function');
    expect(typeof received.a.getMonth).toBe('function');
    expect(typeof received.a.getFullYear).toBe('function');
  });

  it('should deep clone objects (multiple)', async () => {
    const sent = { a: 1, c: { b: 2 } };

    const received = await testEmitMultiple(emitter, sent, sent);

    expect(received).toHaveLength(2);
    expect(received[0]).not.toBe(sent);
    expect(received[1]).not.toBe(sent);
    expect(received[0]).not.toBe(received[1]);

    expect(received[0].c).not.toBe(sent.c);
    expect(received[1].c).not.toBe(sent.c);
    expect(received[0].c).not.toBe(received[1].c);
  });

  it('should fail on uncloneable items', async () => {
    const entries = [Symbol('a'), () => {}];

    for (const entry of entries) {
      await expect(testEmitMultiple(emitter, entry)).rejects.toThrow(
        'could not be cloned',
      );
    }
  });
});

/**
 * Test utility to send data over an event emitter and capture received data.
 */
export const testEmit = async <T>(emitter: EventEmitter, data: T) => {
  return (await testEmitMultiple(emitter, data))[0];
};

/**
 * Test utility to send data over an event emitter and capture received data.
 */
export const testEmitMultiple = <T>(emitter: EventEmitter, ...data: T[]) => {
  return new Promise<T[]>((resolve) => {
    // Define listener to capture emitted data
    const eventListener = (...data: T[]) => {
      emitter.removeListener('event', eventListener);
      resolve(data);
    };

    // Register the listener
    emitter.on('event', eventListener);

    // Emit data
    emitter.emit('event', ...data);
  });
};
