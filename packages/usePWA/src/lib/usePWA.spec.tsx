import { render } from '@testing-library/react';
import { InstallPWAContextProvider, usePWA } from '../index';

// Mock window.matchMedia
describe('usePWA', () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    matchMediaMock.mockClear();
  });

  it('should be used successfully', () => {
    // Mock the return value of window.matchMedia
    matchMediaMock.mockReturnValue({
      matches: true,
      addListener: jest.fn(),
    });

    const UsingPWA = () => {
      const { isInstallable } = usePWA();
      return <div>{isInstallable}</div>;
    };

    const { baseElement } = render(
      <InstallPWAContextProvider>
        <UsingPWA />
      </InstallPWAContextProvider>,
    );

    expect(baseElement).toBeTruthy();
  });
});
