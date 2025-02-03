export enum OutOfBandInvitationError {
  Generic = 'Invalid OutOfBand invitation',
  MissingQueryString = 'Missing query string in URL',
  InvalidJson = 'Invalid JSON format in invitation',
  MissingIdOrType = 'Invalid invitation structure: Missing id or type',
  InvalidBody = 'Invitation body must be an object',
}
