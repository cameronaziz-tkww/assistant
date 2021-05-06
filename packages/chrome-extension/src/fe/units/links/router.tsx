import { links } from '@context';
import { useInitLinks } from '@hooks/links';
import React, { FunctionComponent, useEffect } from 'react';
import Content from './content';

const Router: FunctionComponent = () => {
  const trackedState = links.useTrackedState();
  const setDraft = links.useSetDraft();
  const init = useInitLinks();

  useEffect(
    () => {
      if (!trackedState.hasInit.includes('links')) {
        setDraft((draft) => {
          draft.hasInit = [...draft.hasInit, 'links'];
        });
        init();
      }
    },
    [],
  );

  return (
    <Content />
  );
};

export default Router;
