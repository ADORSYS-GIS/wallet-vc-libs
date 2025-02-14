import { CloneMethodArgs } from '@adorsys-gis/cloning-decorator';
import { MessageRepository } from '@adorsys-gis/message-service';
import EventEmitter from 'eventemitter3';
import { MessageExchangeService as _MessageExchangeService } from './MessageExchangeService';

// This decorator function will deep clone every argument passed to any method of the class
// it decorates, except when it is an instance of `EventEmitter` to preserve the same event
// bus instance between layers.
const decorate = CloneMethodArgs({ exclude: [EventEmitter, MessageRepository] });

export const MessageExchangeService = decorate(_MessageExchangeService);
