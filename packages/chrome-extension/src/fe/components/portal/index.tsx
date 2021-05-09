import { modal } from '@hooks';
import { FunctionComponent, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  id: string;
}

const getElement = () => {
  const element = document.createElement('div');
  element.style.position = 'relative';
  return element;
};

const Portal: FunctionComponent<PortalProps> = (props) => {
  const { children, id } = props;
  const { selection } = modal.useSelection();
  const element = useRef(getElement());

  useEffect(
    () => {
      const container = document.getElementById(id);
      if (container) {
        if (container) {
          container.appendChild(element.current);
        }
      }

      return () => {
        if (container) {
          container.removeChild(element.current);
        }
      };
    },
    [selection],
  );

  return createPortal(
    children,
    element.current,
  );
};

export default Portal;