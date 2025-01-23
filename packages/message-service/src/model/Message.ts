/**
 * Interface representing a message.
 * Each message has an id,sender,receiver, timestamp and the actual message.
 */
export interface Message {
  id: string;
  text: string;
  sender: string; // Sender DID or anything identifying the sender
  contactId: string; // Contact DID (Receipient)
  timestamp: Date;
  direction: 'in' | 'out'; // Tell sent and received messages apart
}
