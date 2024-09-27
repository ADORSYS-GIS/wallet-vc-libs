import EventEmitter from 'eventemitter3';
import { testEmit } from '../emitter/CloningEventEmitter.spec';
import { eventBus } from './EventBus';

enum Events {
  Event1 = 'event1',
  Event2 = 'event2',
  AsyncComplete = 'asyncComplete',
}

describe('eventBus', () => {
  let callback1: jest.Func, callback2: jest.Func;

  beforeAll(() => {
    callback1 = jest.fn((data) => {
      console.log('Subscriber 1 received event1 with data:', data);
    });
    callback2 = jest.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      eventBus.emit(Events.AsyncComplete);
    });
  });

  it('should be instantiated', () => {
    expect(eventBus).toBeDefined();
    expect(eventBus).toBeInstanceOf(EventEmitter);
  });

  it('Should subscribe to events', () => {
    // Subscriber 1
    eventBus.on(Events.Event1, callback1);

    // Subscriber 2
    eventBus.on(Events.Event2, callback2);

    expect(eventBus.eventNames()).toEqual([Events.Event1, Events.Event2]);
  });

  it('Should publish events', () => {
    const data1 = { message: 'Hello from publisher!' };
    eventBus.emit(Events.Event1, data1);
    expect(callback1).toHaveBeenCalled();
    expect(callback1).toHaveBeenCalledWith(data1);
  });

  it('Should show case the EventBus async behavior', async () => {
    const startTime = Date.now();
    // Promise to await the completion of the async operation
    const asyncOperationCompleted = new Promise((resolve) => {
      eventBus.once(Events.AsyncComplete, resolve);
    });

    const data2 = { message: 'Hello again from publisher!' };
    eventBus.emit(Events.Event2, data2);

    // Wait for the async operation to complete
    await asyncOperationCompleted;
    const elapsedTime = Date.now() - startTime;

    expect(callback2).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith(data2);
    expect(elapsedTime).toBeGreaterThanOrEqual(1000);
  });

  it('should deep clone transferred objects', async () => {
    // Prepare
    const data = {
      name: 'John',
      age: 30,
      address: {
        city: 'New York',
        country: 'USA',
      },
      grades: [10, 20],
    };

    // Act
    const received = await testEmit(eventBus, data);

    // Assert
    expect(received).toEqual(data);
    expect(received).not.toBe(data);
    expect(received.address).not.toBe(data.address);
    expect(received.grades).not.toBe(data.grades);
  });
});
