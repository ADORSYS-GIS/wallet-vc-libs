import type { AbbreviatedService, Service } from '../did-methods/IDidMethod';
import { convertServiceToAbbreviatedFormat } from '../utils/convertServiceToAbbreviatedFormat';

describe('convertServiceToAbbreviatedFormat', () => {
  it('should correctly convert Service to AbbreviatedService format', () => {
    // Define a mock Service object
    const service: Service = {
      id: 'service1',
      type: 'dm',
      serviceEndpoint: {
        uri: 'https://example.com',
        accept: ['application/json'],
        routingKeys: ['routingKey1', 'routingKey2'],
      },
    };

    // Expected AbbreviatedService result
    const expected: AbbreviatedService = {
      t: 'dm',
      s: {
        uri: 'https://example.com',
        a: ['application/json'],
        r: ['routingKey1', 'routingKey2'],
      },
    };

    // Call the function
    const result = convertServiceToAbbreviatedFormat(service);

    // Assert the result matches expected structure
    expect(result).toEqual(expected);
  });

  it('should handle optional fields correctly', () => {
    const service: Service = {
      id: 'service2',
      type: 'dm',
      serviceEndpoint: {
        uri: 'https://example.com',
        accept: [],
        routingKeys: [],
      },
    };

    // Expected AbbreviatedService result
    const expected: AbbreviatedService = {
      t: 'dm',
      s: {
        uri: 'https://example.com',
        a: [],
        r: [],
      },
    };

    // Call the function
    const result = convertServiceToAbbreviatedFormat(service);

    // Assert the result matches expected structure
    expect(result).toEqual(expected);
  });

  it('should handle optional fields omitted', () => {
    const service: Service = {
      id: 'service3',
      type: 'dm',
      serviceEndpoint: {
        uri: 'https://example.com',
        // No accept and routingKeys properties provided
      },
    };

    const expected: AbbreviatedService = {
      t: 'dm',
      s: {
        uri: 'https://example.com',
        a: [],
        r: [],
      },
    };

    const result = convertServiceToAbbreviatedFormat(service);
    expect(result).toEqual(expected);
  });
});
