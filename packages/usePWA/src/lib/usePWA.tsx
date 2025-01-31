import { useEffect, useState } from 'react';
import { useInstallPWA } from '../installPWAContext/InstallPWAProvider';
import { BeforeInstallPromptEvent } from '../installPWAContext/installPWA.interface';

type EventHandler = EventListenerOrEventListenerObject;

//This is to make type window.safari
// (detect safari browser on desktop) usage typesafe
declare global {
  interface Window {
    safari: unknown;
  }
}

export function isIosOrSafariDesktop() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || window.safari !== undefined;
}

export function usePWA() {
  const { deferredPrompt, isInstalling, installPWADispatch } = useInstallPWA();
  useEffect(() => {
    const handleBeforeInstallPrompt: EventHandler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      installPWADispatch({
        payload: e as BeforeInstallPromptEvent,
        type: 'SET_PROMPT',
      });
    };

    const handleAppInstalled: EventHandler = () => {
      installPWADispatch({ payload: null, type: 'SET_PROMPT' });
    };

    const cleanup = () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt,
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
      installPWADispatch({ type: 'CLEANUP' });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return cleanup;
  }, [installPWADispatch]);

  async function installApp() {
    installPWADispatch({ payload: true, type: 'UPDATE_INSTALLATION_STATUS' });
    deferredPrompt?.prompt().then(() => {
      installPWADispatch({
        payload: false,
        type: 'UPDATE_INSTALLATION_STATUS',
      });
    });
  }

  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isMinimalUi, setIsMinimalUi] = useState<boolean>(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsMinimalUi(window.matchMedia('(display-mode: minimal-ui)').matches);
  }, []);

  return {
    isInstalled: !deferredPrompt,
    isInstallable:
      !!deferredPrompt && !isInstalling && !(isStandalone || isMinimalUi),
    isInstalling: isInstalling && !!deferredPrompt,
    iOS: {
      isInstallable: !isStandalone,
      isInstalled: isStandalone,
    },
    installApp,
  };
}
