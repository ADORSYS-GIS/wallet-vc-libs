import add from '@iconify/icons-fluent/add-square-24-regular';
import dismiss from '@iconify/icons-fluent/dismiss-circle-24-regular';
import share from '@iconify/icons-fluent/share-ios-48-filled';
import { Icon } from '@iconify/react';
import IconTooltip from './IconTooltip';
import './banner.css';

export default function Banner({
  installApp,
  close,
  isAppleDevice,
}: {
  installApp?: () => Promise<void>;
  close: () => void;
  isAppleDevice?: boolean;
}) {
  return (
    <div className="holder">
      {installApp && !isAppleDevice ? (
        <>
          <span className="message" style={{ textAlign: 'start' }}>
            To access the app from your phone, install now
          </span>
          <button className="install-button" onClick={installApp}>
            Install
          </button>
        </>
      ) : (
        <div
          style={{
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: '1fr auto',
            columnGap: '8px',
          }}
        >
          <span className="message">
            Install this webapp on your device. tap
            <span>
              <Icon
                icon={share}
                fontSize={24}
                style={{ marginBottom: '-5px' }}
              />
            </span>
            and then
            <span>
              <Icon icon={add} fontSize={24} style={{ marginBottom: '-5px' }} />
            </span>
            Add to Homescreen
          </span>
          <IconTooltip label="Close">
            <button className="icon-button" onClick={close}>
              <Icon icon={dismiss} fontSize={24} color="white" />
            </button>
          </IconTooltip>
        </div>
      )}
    </div>
  );
}
