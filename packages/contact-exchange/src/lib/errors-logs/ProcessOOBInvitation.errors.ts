export enum ProcessOOBInvitationError {
  Generic = 'Error processing OOB invitation',
  InvalidInvitation = 'Invalid OOB invitation',
  MissingBody = 'Missing body in the OOB invitation',
  MissingGoalCode = 'Missing goal_code in the invitation body',
  ParsingError = 'Failed to parse OOB invitation from URL',
}
