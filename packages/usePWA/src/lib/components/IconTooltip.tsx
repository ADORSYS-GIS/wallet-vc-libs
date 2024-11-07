import { ReactNode } from 'react';
import './iconTooltip.css';

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
