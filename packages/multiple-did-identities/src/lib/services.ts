import { CloneMethodArgs } from '@adorsys-gis/cloning-decorator';
import EventEmitter from 'eventemitter3';
import { SecurityService } from '../security/SecurityService';
import { DIDIdentityService as _DIDIdentityService } from './DIDIdentityService';

// This decorator function will deep clone every argument
// passed to any method of the class it decorates, except
// when it is an instance of `EventEmitter` to preserve
// the same event bus instance between layers.
// --------------------------------------------------------------------
// FIXME!!! SecurityService is excluded here simply because the cloning
// decorator would make it unusable by discarding its methods. Fix the
// cloning decorator or intended behavior?
const decorate = CloneMethodArgs({ exclude: [EventEmitter, SecurityService] });

export const DIDIdentityService = decorate(_DIDIdentityService);
