import { Message } from 'didcomm';
import { describe, test } from 'vitest';

import {
  ALICE_DID,
  ALICE_DID_DOC,
  ALICE_SECRETS,
  BOB_DID,
  BOB_DID_DOC,
  BOB_SECRETS,
  ExampleDIDResolver,
  ExampleSecretsResolver,
} from './helper';

describe('didcomm', () => {
  test('authentication example', async () => {
    const msg = new Message({
      id: '1234567890',
      typ: 'application/didcomm-plain+json',
      type: 'http://example.com/protocols/lets_do_lunch/1.0/proposal',
      from: ALICE_DID,
      to: [BOB_DID],
      created_time: 1516269022,
      expires_time: 1516385931,
      body: { messagespecificattribute: 'and its value' },
    });

    // --- Packing encrypted and authenticated message ---

    let didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    let secretsResolver = new ExampleSecretsResolver(ALICE_SECRETS);

    const [encryptedMsg, encryptMetadata] = await msg.pack_encrypted(
      BOB_DID,
      ALICE_DID,
      null,
      didResolver,
      secretsResolver,
      {
        forward: false, // Forward wrapping is unsupported in current version
      },
    );

    console.log('Encryption metadata is\n', encryptMetadata);

    // --- Send message ---
    console.log('Sending message\n', encryptedMsg);

    // --- Unpacking message ---
    didResolver = new ExampleDIDResolver([ALICE_DID_DOC, BOB_DID_DOC]);
    secretsResolver = new ExampleSecretsResolver(BOB_SECRETS);

    const [unpackedMsg, unpackMetadata] = await Message.unpack(
      encryptedMsg,
      didResolver,
      secretsResolver,
      {},
    );

    console.log('Receved message is\n', unpackedMsg.as_value());
    console.log('Receved message unpack metadata is\n', unpackMetadata);
  });
});
