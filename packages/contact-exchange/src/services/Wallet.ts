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

  addContact(contact: Contact, identity: string): void {
    if (!this.isValidContact(contact)) {
      throw new Error(`Invalid contact: ${contact}`);
    }
    const didWithoutFragment = contact.did.split('#')[0];
    if (this.identities.has(identity)) {
      const existingContacts = this.identities.get(identity);
      if (
        existingContacts &&
        existingContacts.some((c) => c.did.split('#')[0] === didWithoutFragment)
      ) {
        console.log(
          `Contact already exists in wallet for identity ${identity}`,
        );
        return;
      }
    }
    if (!this.identities.has(identity)) {
      this.identities.set(identity, []);
    }
    this.identities.get(identity)?.push(contact);
  }

  private isValidContact(contact: Contact): boolean {
    if (!contact.did || !contact.serviceEndpoint) {
      return false;
    }
    if (contact.label && contact.label.length > 50) {
      return false;
    }
    return (
      contact.did.startsWith('did:') &&
      contact.serviceEndpoint.startsWith('http')
    );
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
}
