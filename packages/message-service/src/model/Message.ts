/**
 * Interface representing a message.
 * Each message has an id,sender,receiver, timestamp and the actual message.
 */
export interface Message {
  id: string;
  text: string;
  sender: string; //sender DID or anything identifying the sender
  contactId: string; // contact DID
  timestamp: Date;
}
