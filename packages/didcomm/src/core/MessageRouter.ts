import { DIDResolver, Message, SecretsResolver } from 'didcomm-node';
import { v4 as uuidv4 } from 'uuid';
import { MessageTyp, MessageType } from './Messages.types';

// Function to create a routed message for any sender, recipient, and mediator
export async function createRoutedMessage(
  senderDid: string,
  recipientDid: string,
  messageType: MessageType,
  messageTyp: MessageTyp,
  messageBody: object,
  secretsResolver: SecretsResolver,
  didResolver: DIDResolver,
  expiresTime: number,
): Promise<string> {
  const routedMessage = new Message({
    id: uuidv4(),
    typ: messageTyp,
    type: messageType,
    from: senderDid,
    to: [recipientDid],
    created_time: Math.round(new Date().getTime() / 1000),
    expires_time: expiresTime,
    body: messageBody,
  });

  // Pack the message to simulate sending it
  const [encryptedMsg] = await routedMessage.pack_encrypted(
    recipientDid,
    senderDid,
    senderDid,
    didResolver,
    secretsResolver,
    {
      forward: false,
    },
  );

  return encryptedMsg;
}
