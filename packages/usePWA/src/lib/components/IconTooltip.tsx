import './iconTooltip.css';

import type { ReactNode } from 'react';

export default function IconTooltip({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="tooltips">
      {children}
      <span className="tooltiptexts">{label}</span>
    </div>
  );
}
