import React, { FunctionComponent } from 'react';
import Pill from '@components/pill';
import * as Styled from './styled';

interface TitleProps {
  title: App.Card.Title;
}

const Title: FunctionComponent<TitleProps> = (props) => {
  const { title } = props;
  if (title.pill) {
    return (
      <Styled.Title>
        <Pill
          onClick={title.onClick}
          themeColor="secondary"
          label={title.text}
        />
      </Styled.Title>
    );
  }
  return (
    <Styled.Title>
      {title.text}
    </Styled.Title>
  );
};

export default Title;
