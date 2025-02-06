import type { EventEmitter } from 'eventemitter3';

import { CloningEventEmitter } from '../emitter/CloningEventEmitter';

/**
 * EventBus class represents a singleton event bus instance using EventEmitter3.
 * It provides a central communication channel for emitting and listening to events.
 */
class EventBus {
  /**
   * Singleton instance of the EventEmitter.
   * It holds the reference to the unique event bus instance.
   */
  private static instance: EventEmitter;

  /**
   * Initializes the event bus instance.
   * If the instance doesn't exist, creates a new one; otherwise, returns the existing instance.
   * @returns The initialized EventEmitter instance representing the event bus.
   */
  static init(): EventEmitter {
    // Check if the instance already exists
    if (!EventBus.instance) {
      // If the instance doesn't exist, create a new EventEmitter instance
      EventBus.instance = new CloningEventEmitter();
    }
    // Return the initialized instance
    return EventBus.instance;
  }
}

// Initialize and export the singleton instance of the event bus
export const eventBus = EventBus.init();
