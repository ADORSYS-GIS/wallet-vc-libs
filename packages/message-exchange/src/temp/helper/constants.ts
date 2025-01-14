import { DIDDoc, Secret } from 'didcomm';

export const ALICE_DID_DOC: DIDDoc = {
  id: 'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m',
  verificationMethod: [
    {
      id: 'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m#z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m',
      type: 'JsonWebKey2020',
      controller: 'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'IOcpUpwb7q_ZgNzUKrDa5xkUR1OpE5h_cfeXWatxktY',
      },
    },
    {
      id: 'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m#z6LSgu265BN1TmXbnfTXrX8LVSoAU2JG1K3kTbmUeA2zRkwW',
      type: 'JsonWebKey2020',
      controller: 'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        x: 'TZS42KEM_dhmBlrPGBzo7fEPW1qv39eqrzEbPF3ZqxU',
      },
    },
  ],
  authentication: [
    'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m#z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m',
  ],

  keyAgreement: [
    'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m#z6LSgu265BN1TmXbnfTXrX8LVSoAU2JG1K3kTbmUeA2zRkwW',
  ],
  service: [],
};

export const ALICE_SECRETS: Secret[] = [
  {
    id: 'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m#z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      d: '4Cfx7IAYVDzOeoqTIPQ5rmBGwtuyC6g9eO-wm7sc-Hc',
      crv: 'Ed25519',
      x: 'IOcpUpwb7q_ZgNzUKrDa5xkUR1OpE5h_cfeXWatxktY',
    },
  },
  {
    id: 'did:key:z6MkgfhXpMui5YPSXRmxT4LWuNT5Hb8ciypFmRhwxnP5gw2m#z6LSgu265BN1TmXbnfTXrX8LVSoAU2JG1K3kTbmUeA2zRkwW',
    type: 'JsonWebKey2020',
    privateKeyJwk: {
      kty: 'OKP',
      crv: 'X25519',
      x: 'TZS42KEM_dhmBlrPGBzo7fEPW1qv39eqrzEbPF3ZqxU',
      d: 'EOEk_5BgaLE5lUcg65PvacZwjAZqCe_MUqD-fW7-n3E',
    },
  },
];

export const BOB_DID_DOC = ALICE_DID_DOC;
export const BOB_SECRETS = ALICE_SECRETS;
export const ALICE_DID = ALICE_DID_DOC.id;
export const BOB_DID = BOB_DID_DOC.id;
