import { Secret } from 'didcomm';

import {
    DidIdentityWithDecryptedKeys,
    DidRepository,
    PrivateKeyJWK
} from '@adorsys-gis/multiple-did-identities';

// import { DidRepository } from '@adorsys-gis/multiple-did-identities/src/repository/DidRepository'; 

export async function processStatusRequest(
    mediatorDid: string,
    aliceDidForMediator: string,
    didRepository: DidRepository
) {
    console.log('processStatusRequest');
    const secretPinNumber = 1234; // Replace with the actual pin number
    const statusRequestService = new StatusRequestService(didRepository, secretPinNumber);

    try {
        const secrets = await statusRequestService.retrieveSenderDidSecrets(aliceDidForMediator);
        console.log('Retrieved Secrets:', secrets);
    } catch (error) {
        console.error('Error retrieving secrets:', error);
    }

    
}

export class StatusRequestService {
  private didRepository: DidRepository;
  private secretPinNumber: number;

  constructor(didRepository: DidRepository, secretPinNumber: number) {
    this.didRepository = didRepository;
    this.secretPinNumber = secretPinNumber;
  }

  public async retrieveSenderDidSecrets(senderDid: string): Promise<Secret[]> {
    let privateKeys: DidIdentityWithDecryptedKeys | null;

    try {
      privateKeys = await this.didRepository.getADidWithDecryptedPrivateKeys(
        senderDid,
        this.secretPinNumber,
      );
    } catch (e) {
      console.error(e);
      throw new Error(
        'Repository failure while retrieving private keys for senderDid',
      );
    }

    if (!privateKeys) {
      throw new Error('Inexistent private keys for senderDid');
    }
    console.log('privateKeys: ', privateKeys);
    const secrets = Object.values(privateKeys.decryptedPrivateKeys).filter(
      (key): key is PrivateKeyJWK => 'privateKeyJwk' in key,
    );

    if (secrets.length == 0) {
      throw new Error('Cannot proceed with no sender secrets');
    }

    return secrets;
  }
}
