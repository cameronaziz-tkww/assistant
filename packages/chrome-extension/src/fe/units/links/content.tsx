import { modal } from '@context';
import { links } from '@hooks';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Link from './link';
import * as Styled from './styled';

const LinksUI: FunctionComponent = () => {
  const { active } = links.useLinks();
  const setEnabled = links.useHotkeyLinks();
  const { selection } = modal.useTrackedState();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(
    () => {
      window.addEventListener('focus', windowFocus);
      window.addEventListener('blur', windowBlur);

      return () => {
        window.removeEventListener('focus', windowFocus);
        window.removeEventListener('blur', windowBlur);
      };
    },
    [],
  );

  const windowBlur = () => {
    setIsFocused(false);
  };

  const windowFocus = () => {
    setIsFocused(true);
  };

  useEffect(
    () => {
      if (selection === null) {
        setEnabled(true);
        return;
      }
      setEnabled(false);
    },
    [selection],
  );

  return (
    <Styled.Container>
      <DndProvider backend={HTML5Backend}>
        {active.map((link) =>
          <Link
            isFocused={isFocused}
            key={link.id}
            id={link.id}
          />,
        )}
      </DndProvider>
    </Styled.Container>
  );
};

export default LinksUI;
