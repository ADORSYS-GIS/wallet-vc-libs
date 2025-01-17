import { OOBServiceError } from '../lib/errors-logs/OOBServiceError';
import { WalletError } from '../lib/errors-logs/Wallet.errors';
import { logError } from '../lib/errors-logs/logger';

export interface Contact {
  id: string;
  from: string;
  type: string;
}
export class Wallet {
  private identities: Map<string, Contact[]>;

  constructor() {
    this.identities = new Map();
  }

  addContact(contact: Contact, identity: string): void {
    if (!this.isValidContact(contact)) {
      const errors = this.getValidationErrors(contact);
      throw new OOBServiceError(
        `${WalletError.InvalidContact}: ${errors.join(', ')}`,
      );
    }

    const didWithoutFragment = contact.id.split('#')[0];
    if (this.identities.has(identity)) {
      const existingContacts = this.identities.get(identity);
      if (
        existingContacts &&
        existingContacts.some((c) => c.id.split('#')[0] === didWithoutFragment)
      ) {
        logError(
          new Error(
            `${WalletError.ContactAlreadyExists} for identity ${identity}`,
          ),
          'Adding Contact',
        );
        return;
      }
    }
    if (!this.identities.has(identity)) {
      this.identities.set(identity, []);
    }
    this.identities.get(identity)?.push(contact);
  }

  public isValidContact(contact: Contact): boolean {
    const errors = this.getValidationErrors(contact);
    return errors.length === 0;
  }

  private getValidationErrors(contact: Contact): string[] {
    const errors = [];
    if (!contact.type || !contact.type.startsWith('https:')) {
      errors.push('Invalid type');
    }
    if (
      !contact.id ||
      !(contact.id.startsWith('invitation-id') || contact.id.startsWith('did:'))
    ) {
      errors.push('Invalid id');
    }
    if (!contact.from || !contact.from.startsWith('did:')) {
      errors.push('Invalid from');
    }
    return errors;
  }

  getContacts(identity: string): Contact[] {
    return [...(this.identities.get(identity) || [])];
  }

  getAllContacts(): Contact[] {
    const allContacts: Contact[] = [];
    for (const contacts of Array.from(this.identities.values())) {
      allContacts.push(...contacts);
    }
    return allContacts;
  }

  removeContact(contact: Contact, identity: string): void {
    if (this.identities.has(identity)) {
      const existingContacts = this.identities.get(identity);
      if (existingContacts && existingContacts.includes(contact)) {
        const updatedContacts = existingContacts.filter((c) => c !== contact);
        this.identities.set(identity, updatedContacts);
      }
    }
  }

  removeContactById(id: string, identity: string): void {
    if (this.identities.has(identity)) {
      const existingContacts = this.identities.get(identity);
      if (existingContacts) {
        const contactToRemove = existingContacts.find((c) => c.id === id);
        if (contactToRemove) {
          const updatedContacts = existingContacts.filter(
            (c) => c !== contactToRemove,
          );
          this.identities.set(identity, updatedContacts);
        }
      }
    }
  }
}
