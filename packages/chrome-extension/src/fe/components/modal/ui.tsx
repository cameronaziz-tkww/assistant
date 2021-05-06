import { links, modal } from '@hooks';
import React, { FunctionComponent, useEffect, useRef } from 'react';
import * as Styled from './screens';
import Tabs from './tabs';

const Modal: FunctionComponent = () => {
  const fullScreenRef = useRef<HTMLDivElement>(null);
  const { selection } = modal.useSelection();
  const update = modal.useUpdate();

  const { save: saveLinks } = links.useSaveLinks();

  useEffect(
    () => {
      document.addEventListener('keydown', keydown);

      return () => {
        document.removeEventListener('keydown', keydown);
      };
    },
    [],
  );

  useEffect(
    () => {
      if (fullScreenRef.current) {
        fullScreenRef.current.addEventListener('click', clickOutside);
      }

      return () => {
        if (fullScreenRef.current) {
          fullScreenRef.current.removeEventListener('click', clickOutside);
        }
      };
    },
  );

  const sendSave = () => {
    saveLinks();
  };

  const closeModal = () => {
    sendSave();
    update.selection(null);
  };

  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };

  const clickOutside = (event: MouseEvent) => {
    if (event.target === fullScreenRef.current) {
      closeModal();
    }
  };

  if (!selection) {
    return null;
  }

  return (
    <Styled.Container ref={fullScreenRef}>
      <Styled.ContentContainer>
        <Styled.CloseButton onClick={closeModal} round Icon={Styled.Close}>
        </Styled.CloseButton>
        <Styled.Content>
          <Styled.SelectionContentContainer>
            <Styled.Heading>
              <Styled.Title>
                TKWW Assistant
              </Styled.Title>
            </Styled.Heading>
            <Tabs />
            <Styled.SelectionContent id="modalContent" />
          </Styled.SelectionContentContainer>
        </Styled.Content>
      </Styled.ContentContainer>
    </Styled.Container>
  );
};

export default Modal;
