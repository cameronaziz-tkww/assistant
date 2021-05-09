import { modal } from '@hooks';
import { FunctionComponent, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  selectionTrigger: App.SettingsTab | 'save' | null;
}

const getElement = () => {
  const element = document.createElement('div');
  element.style.position = 'relative';
  return element;
};

const Portal: FunctionComponent<PortalProps> = (props) => {
  const { children, selectionTrigger } = props;
  const { selection } = modal.useSelection();
  const element = useRef(getElement());

  useEffect(
    () => {
      const container = document.getElementById('modalContent');
      if (container) {
        if (container && selection === selectionTrigger) {
          container.appendChild(element.current);
        }
      }

      return () => {
        if (container && selection === selectionTrigger) {
          container.removeChild(element.current);
        }
      };
    },
    [selection],
  );

  if (selection !== selectionTrigger) {
    return null;
  }

  return createPortal(
    children,
    element.current,
  );
};

export default Portal;