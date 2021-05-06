import { useInterval } from '@hooks';
import React, { FunctionComponent, useState } from 'react';
import * as Styled from './styled';

interface LoadingProps {
  message: string;
}

const availableDots = [
  '.',
  '..',
  '...',
];

const getDots = (count: number): string => {
  const index = count % availableDots.length;
  return availableDots[index];
};

const Loading: FunctionComponent<LoadingProps> = (props) => {
  const { message } = props;
  const [count, setCount] = useState(0);

  useInterval(
    () => {
      setCount(count + 1);
    },
    300,
  );

  const dots = getDots(count);

  return (
    <Styled.LoadingMessage>
      {message}{dots}
    </Styled.LoadingMessage>
  );
};

export default Loading;
