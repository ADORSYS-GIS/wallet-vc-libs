// contact storage system that supports multiple identities

export interface Contact {
  did: string;
  label?: string;
  serviceEndpoint?: string;
}

export class Wallet {
  private identities: Map<string, Contact[]>;

  constructor() {
    this.identities = new Map();
  }

  // Store contact for a specific identity
  addContact(contact: Contact, identity: string): void {
    // Validate the contact before adding
    if (!contact.did || !contact.serviceEndpoint) {
      console.log(
        'Invalid contact: missing required fields (did or serviceEndpoint)',
      );
      return;
    }

    if (!this.identities.has(identity)) {
      this.identities.set(identity, []);
    }
    this.identities.get(identity)?.push(contact);
  }

  // Retrieve contacts available to a specific identity
  getContacts(identity: string): Contact[] {
    return this.identities.get(identity) || [];
  }

  // Retrieve all contacts across all identities
  getAllContacts(): Contact[] {
    const allContacts: Contact[] = [];
    for (const contacts of Array.from(this.identities.values())) {
      allContacts.push(...contacts);
    }
    return allContacts;
  }
}
