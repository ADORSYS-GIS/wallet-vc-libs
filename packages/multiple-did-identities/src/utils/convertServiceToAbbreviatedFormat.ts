import { Service, AbbreviatedService } from '../did-methods/IDidMethod';

export function convertServiceToAbbreviatedFormat(service: Service): AbbreviatedService {
    return {
        t: 'dm',
        s: {
            uri: service.serviceEndpoint.uri,
            a: service.serviceEndpoint.accept || [],
            r: service.serviceEndpoint.routingKeys || []
        }
    };
}