import { Portal } from '@components/modal';
import { links } from '@context';
import { useInitLinks } from '@hooks/links';
import { LinksScreen } from '@screens';
import React, { Fragment, FunctionComponent, useEffect } from 'react';
import Content from './content';

interface LinksProps {
  isVisible: boolean;
}

const Links: FunctionComponent<LinksProps> = (props) => {
  const { isVisible } = props;
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
    <Fragment>
      {isVisible &&
        <Content />
      }
      <Portal selectionTrigger="links">
        <LinksScreen />
      </Portal>
    </Fragment>
  );
};

export default Links;
