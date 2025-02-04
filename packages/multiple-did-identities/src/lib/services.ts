import { CloneMethodArgs } from '@adorsys-gis/cloning-decorator';
import EventEmitter from 'eventemitter3';
import { SecurityService } from '../security/SecurityService';
import { DIDIdentityService as _DIDIdentityService } from './DIDIdentityService';

// This decorator function will deep clone every argument
// passed to any method of the class it decorates, except
// when it is an instance of `EventEmitter` to preserve
// the same event bus instance between layers.
const decorate = CloneMethodArgs({ exclude: [EventEmitter, SecurityService] });

export const DIDIdentityService = decorate(_DIDIdentityService);
