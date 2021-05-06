import Checkbox from '@components/checkbox';
import Tooltip from '@components/tooltip';
import { github } from '@hooks';
import React, { CSSProperties, FunctionComponent, useEffect, useRef, useState } from 'react';
import * as Styled from './styled';

interface RepoProps {
  repository: App.Github.Repository;
  type: 'unwatched' | 'watched';
  style: CSSProperties
}

const Repo: FunctionComponent<RepoProps> = (props) => {
  const { repository, style, type } = props;
  const [isSelected, setIsSelected] = useState(false);
  const [isEllipsis, setIsEllipsis] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);
  const { updateWatched } = github.useRepositories();

  useEffect(
    () => {
      if (labelRef.current) {
        const { current } = labelRef;
        const isActive = current.offsetHeight < current.scrollHeight || current.offsetWidth < current.scrollWidth;
        setIsEllipsis(isActive);
      }
    },
    [labelRef],
  );

  const addRepo = () => {
    updateWatched({
      ...repository,
      isWatched: true,
    });
  };

  const removeRepo = () => {
    updateWatched({
      ...repository,
      isWatched: false,
    });
  };

  const onClick = () => {
    if (type === 'unwatched') {
      addRepo();
      return;
    }
    removeRepo();
  };

  const select = () => {
    setIsSelected(true);
    onClick();
  };

  return (
    <Styled.RepoContainer style={style} onClick={select}>
      <Tooltip
        truncate
        size="sm"
        isDisabled={!isEllipsis}
        text={repository.fullName}
        cursorType="pointer"
      >
        <Checkbox
          handleClick={select}
          label={repository.fullName}
          ref={labelRef}
          isChecked={false}
        />
      </Tooltip>
    </Styled.RepoContainer>
  );
};

export default Repo;
