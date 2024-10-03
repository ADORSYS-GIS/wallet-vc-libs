/**
 * Interface representing a contact.
 * Each contact has an id, name, email, did, and a phone number.
 */
export interface Contact {
  id?: number;
  name: string;
  email: string;
  did: string;
  phoneNumber: string;
}
