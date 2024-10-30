import './loading.css';

export interface ILoadingProps {
  message: string;
}

export function Loading({ message }: ILoadingProps) {
  return (
    <div className="loading-span">
      <span role="img" aria-label="loading" style={{ animation: 'none' }}>
        {message}
      </span>
      {'...'.split('').map((letter, index) => (
        <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
          {letter}
        </span>
      ))}
    </div>
  );
}
