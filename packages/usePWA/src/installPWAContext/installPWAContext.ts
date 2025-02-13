import { createContext } from 'react';
import type { InstallPWA } from './installPWA.interface';

export const initialState: InstallPWA = {
  deferredPrompt: null,
  isInstalling: false,
  installPWADispatch: () => null,
};
const InstallPWAContext = createContext(initialState);

export default InstallPWAContext;
