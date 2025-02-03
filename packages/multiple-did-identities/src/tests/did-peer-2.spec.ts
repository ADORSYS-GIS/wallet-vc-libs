import { DidPeerMethod } from '../did-methods/DidPeerMethod';
import { DIDKeyPairMethod2 } from '../did-methods/IDidMethod';

describe('DidPeerMethod', () => {
  let didPeerMethod: DidPeerMethod;

  beforeEach(() => {
    didPeerMethod = new DidPeerMethod();
  });

  test('should generate a valid DIDKeyPairMethod2', async () => {
    const result: DIDKeyPairMethod2 = await didPeerMethod.generateMethod2();

    // Assertions
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('didDocument');
    expect(result).toHaveProperty('privateKeyV');
    expect(result).toHaveProperty('publicKeyV');
    expect(result).toHaveProperty('privateKeyE');
    expect(result).toHaveProperty('publicKeyE');

    // Validate DID structure
    expect(result.did).toMatch(/^did:peer:2/); // Check if DID starts with 'did:peer:2'

    // Validate didDocument properties
    expect(result.didDocument).toHaveProperty(
      '@context',
      expect.arrayContaining(['https://www.w3.org/ns/did/v1']),
    );
    expect(result.didDocument).toHaveProperty('id', result.did);
    console.log(result.type); // should output mediator
    expect(result).toHaveProperty('type', result.type);

    // Validate verificationMethod
    if (result.didDocument.verificationMethod) {
      expect(result.didDocument.verificationMethod).toHaveLength(2); // Expecting two verification methods
      expect(result.didDocument.verificationMethod[0].id).toBe('#key-1');
      expect(result.didDocument.verificationMethod[1].id).toBe('#key-2');
    } else {
      fail('Verification methods should be defined.');
    }

    // Validate services
    if (result.didDocument.service) {
      expect(result.didDocument.service).toHaveLength(1); // Expecting one service
      expect(result.didDocument.service[0].id).toBe('#didcommmessaging');
    } else {
      fail('Services should be defined.');
    }

    // Check if privateKeyV and privateKeyE are defined before accessing their properties
    if (result.privateKeyV && result.privateKeyE) {
      // Check that privateKeyJwk.id is set correctly
      expect(result.privateKeyV.id).toBe(`${result.did}#key-1`);
      expect(result.privateKeyE.id).toBe(`${result.did}#key-2`);
    } else {
      fail('Private keys should be defined.');
    }
  });

  it('should generate a valid DIDKeyPairMethod2 with mediator routing keys', async () => {
    const mediatorRoutingKeys = 'routingKey1';

    // Generate the DID using the method with routing keys
    const result: DIDKeyPairMethod2 =
      await didPeerMethod.generateMethod2RoutingKey(mediatorRoutingKeys);

    // Assertions for the result
    expect(result).toHaveProperty('did');
    expect(result).toHaveProperty('type');
    expect(result).toHaveProperty('didDocument');
    expect(result).toHaveProperty('privateKeyV');
    expect(result).toHaveProperty('publicKeyV');
    expect(result).toHaveProperty('privateKeyE');
    expect(result).toHaveProperty('publicKeyE');

    // Validate DID structure
    expect(result.did).toMatch(/^did:peer:2/); // Check if DID starts with 'did:peer:2'

    // Validate didDocument properties
    expect(result.didDocument).toHaveProperty(
      '@context',
      expect.arrayContaining(['https://www.w3.org/ns/did/v1']),
    );
    expect(result.didDocument).toHaveProperty('id', result.did);
    console.log(result.type); // should output peer_contact
    expect(result).toHaveProperty('type', result.type);

    // Validate verificationMethod
    if (result.didDocument.verificationMethod) {
      expect(result.didDocument.verificationMethod).toHaveLength(2); // Expecting two verification methods
      expect(result.didDocument.verificationMethod[0].id).toBe('#key-1');
      expect(result.didDocument.verificationMethod[1].id).toBe('#key-2');
    } else {
      fail('Verification methods should be defined.');
    }

    // Validate services and routing keys
    if (result.didDocument.service) {
      expect(result.didDocument.service).toHaveLength(1); // Expecting one service
      expect(result.didDocument.service[0].id).toBe('#didcommmessaging');
      expect(result.didDocument.service[0].serviceEndpoint.uri).toEqual(
        mediatorRoutingKeys,
      );
    } else {
      fail('Services should be defined.');
    }

    // Check that privateKeyV and privateKeyE are defined before accessing their properties
    if (result.privateKeyV && result.privateKeyE) {
      // Check that privateKeyJwk.id is set correctly
      expect(result.privateKeyV.id).toBe(`${result.did}#key-1`);
      expect(result.privateKeyE.id).toBe(`${result.did}#key-2`);
    } else {
      fail('Private keys should be defined.');
    }
  });
});
