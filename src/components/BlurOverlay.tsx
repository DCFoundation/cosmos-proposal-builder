import { useEffect, useRef } from 'react';

interface BlurOverlayProps {
  isVisible: boolean;
  targetRef: React.RefObject<HTMLElement>;
  onOverlayClick: () => void;
}

const BlurOverlay: React.FC<BlurOverlayProps> = ({
  isVisible,
  targetRef,
  onOverlayClick,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const target = targetRef.current;

    if (isVisible && overlay && target) {
      const { top, left, width, height } = target.getBoundingClientRect();
      const radius = Math.max(width, height) / 2;

      overlay.style.clipPath = `circle(${radius}px at ${left + width / 2}px ${
        top + height / 2
      }px)`;
    }
  }, [isVisible, targetRef]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className='fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm'
      onClick={onOverlayClick}
    />
  );
};

export { BlurOverlay };
