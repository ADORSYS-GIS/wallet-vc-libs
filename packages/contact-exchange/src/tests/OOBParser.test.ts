import { OOBServiceError } from '../lib/errors-logs/OOBServiceError';
import { OutOfBandInvitationError } from '../lib/errors-logs/OutOfBandInvitation.errors';
import { parseOOBInvitation } from '../services/OOBParser';

describe('parseOOBInvitation', () => {
  it('should throw MissingIdOrType error for an invitation with a missing type', () => {
    const url = 'https://example.com/_oob=eyJpZCI6IjEyMzQ1In0='; // Missing `type`
    expect(() => parseOOBInvitation(url)).toThrow(
      new OOBServiceError(OutOfBandInvitationError.MissingIdOrType),
    );
  });

  it('should throw InvalidBody error for an invitation with a non-object body', () => {
    const url =
      'https://example.com/_oob=eyJpZCI6IjEyMzQ1IiwidHlwZSI6Ik52YXRpb24iLCJib2R5IjoiVGhpcyBpcyBhIHN0cmluZywgbm90IGFuIG9iamVjdCBib2R5In0='; // Body is a string
    expect(() => parseOOBInvitation(url)).toThrow(
      new OOBServiceError(OutOfBandInvitationError.InvalidBody),
    );
  });
  it('should throw MissingQueryString error for a URL without the query string', () => {
    const url = 'https://example.com/invalid-url';
    expect(() => parseOOBInvitation(url)).toThrow(
      new OOBServiceError(OutOfBandInvitationError.MissingQueryString),
    );
  });

  it('should throw InvalidJson error for a URL with an invalid base64 part', () => {
    const url = 'https://example.com/_oob=invalid-base64';
    expect(() => parseOOBInvitation(url)).toThrow(
      new OOBServiceError(OutOfBandInvitationError.InvalidJson),
    );
  });

  it('should throw an error when invitation is', () => {
    const url = 'https://example.com/_oob=InvalidBase64';
    jest.spyOn(Buffer, 'from').mockImplementationOnce(() => {
      throw new Error('Unknown error');
    });

    expect(() => parseOOBInvitation(url)).toThrow(
      new OOBServiceError(OutOfBandInvitationError.Generic),
    );
  });

  it('should return a valid OutOfBandInvitation for a valid URL', () => {
    const validInvitation = {
      id: '12345',
      type: 'test',
      body: { key: 'value' },
    };
    const encodedInvitation = Buffer.from(
      JSON.stringify(validInvitation),
    ).toString('base64');
    const url = `https://example.com/_oob=${encodedInvitation}`;
    const parsedInvitation = parseOOBInvitation(url);

    expect(parsedInvitation).toEqual(validInvitation);
  });
});
