import { parseOOBInvitation } from '../services/OOBParser';
import { OutOfBandInvitation } from '../services/DIDCommOOBInvitation';
import { validEncodedUrl, validOutOfBandInvitation } from './OOBTestFixtures';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('parseOOBInvitation', () => {
  it('should return null for an invalid URL', () => {
    const url = 'https://example.com/invalid-url';
    expect(parseOOBInvitation(url)).toBeNull();
  });

  it('should return null for a URL without a base64 encoded part', () => {
    const url = 'https://example.com/_oob=';
    expect(parseOOBInvitation(url)).toBeNull();
  });

  it('should return null for a URL with an invalid base64 encoded part', () => {
    const url = 'https://example.com/_oob=InvalidBase64';
    expect(parseOOBInvitation(url)).toBeNull();
  });

  it('should return null for a URL with an invalid JSON encoded part', () => {
    const url = 'https://example.com/_oob=eyJzdWIiOiJzdWIiLCJzdWIiOiJzdWIifQ==';
    expect(parseOOBInvitation(url)).toBeNull();
  });

  it('should return null for an invitation with a missing id', () => {
    const url =
      'https://example.com/_oob=eyJzdWIiOiJzdWIiLCJ0eXBlIjoiIHR5cGUifQ==';
    expect(parseOOBInvitation(url)).toBeNull();
  });

  it('should return null for an invitation with a missing type', () => {
    const url = 'https://example.com/_oob=eyJzdWIiOiJzdWIiLCJpZCI6ImlkIn0=';
    expect(parseOOBInvitation(url)).toBeNull();
  });

  it('should return null for an invitation with a non-object body', () => {
    const url =
      'https://example.com/_oob=eyJzdWIiOiJzdWIiLCJ0eXBlIjoiIHR5cGUifQ==';
    expect(parseOOBInvitation(url)).toBeNull();
  });

  it('should return a valid OutOfBandInvitation for a valid URL', () => {
    const url = `https://example.com/${validEncodedUrl}`;
    const expectedInvitation: OutOfBandInvitation = {
      id: validOutOfBandInvitation.id,
      type: validOutOfBandInvitation.type,
      body: validOutOfBandInvitation.body,
      encodedPart: '',
      from: validOutOfBandInvitation.from,
    };
    expect(parseOOBInvitation(url)).toEqual(expectedInvitation);
  });
});
