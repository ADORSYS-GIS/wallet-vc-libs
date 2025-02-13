import add from '@iconify/icons-fluent/add-square-24-regular';
import dismiss from '@iconify/icons-fluent/dismiss-circle-24-filled';
import share from '@iconify/icons-fluent/share-ios-48-filled';
import { Icon } from '@iconify/react';
import IconTooltip from './IconTooltip';
import './tooltip.css';

export default function Tooltip({ close }: { close: () => void }) {
  return (
    <div
      style={{
        display: 'grid',
        alignItems: 'center',
        gridTemplateRows: 'auto 1fr',
        justifyItems: 'right',
      }}
      className="tooltiptext"
    >
      <IconTooltip label="Close">
        <button className="icon-button" onClick={close}>
          <Icon icon={dismiss} fontSize={24} color="white" />
        </button>
      </IconTooltip>
      <span className="message">
        Install this webapp on your device. tap
        <span>
          <Icon icon={share} fontSize={24} style={{ marginBottom: '-5px' }} />
        </span>
        and then
        <span>
          <Icon icon={add} fontSize={24} style={{ marginBottom: '-5px' }} />
        </span>
        Add to Homescreen
      </span>
    </div>
  );
}
