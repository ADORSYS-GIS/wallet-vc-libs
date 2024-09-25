import { EventEmitter } from 'eventemitter3';

/**
 * This specialized event emitter deep clones all emitted objects.
 */
export class CloningEventEmitter<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  Context = unknown
> extends EventEmitter<EventTypes, Context> {
  /**
   * Calls each of the listeners registered for a given event.
   *
   * This overriding logic deep clones all emitted objects using
   * the `structuredClone` global function. Uncloneable objects
   * lead to a `DataCloneError`.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
   */
  override emit<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    ...args: EventEmitter.EventArgs<EventTypes, T>
  ): boolean {
    const clonedArgs = args.map((arg) => structuredClone(arg)) as Parameters<
      EventEmitter.EventListener<EventTypes, T>
    >;

    return super.emit(event, ...clonedArgs);
  }
}
