import Checkbox from '@components/checkbox';
import Tooltip from '@components/tooltip';
import { github } from '@hooks';
import React, { CSSProperties, FunctionComponent, MouseEvent, useEffect, useRef, useState } from 'react';
import * as Styled from './styled';

interface RepoProps {
  repository: App.Github.Repository;
  type: 'unwatched' | 'watched';
  style: CSSProperties;
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

  const clickCheckbox = () => {
    setIsSelected(true);
    onClick();
  };

  const clickContainer = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.currentTarget === event.target) {
      setIsSelected(true);
      onClick();
    }
  };

  return (
    <Styled.RepoContainer style={style} onClick={clickContainer}>
      <Tooltip
        truncate
        size="sm"
        isDisabled={!isEllipsis}
        text={repository.fullName}
        cursorType="pointer"
      >
        <Checkbox
          handleClick={clickCheckbox}
          label={repository.fullName}
          ref={labelRef}
          isChecked={false}
        />
      </Tooltip>
    </Styled.RepoContainer>
  );
};

export default Repo;
