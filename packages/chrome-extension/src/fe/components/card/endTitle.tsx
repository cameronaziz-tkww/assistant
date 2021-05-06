import React, { FunctionComponent, Fragment, ReactNode } from 'react';
import Pill from '@components/pill';

const isEndTitleObject = (unknown?: ReactNode | App.Card.EndTitle): unknown is App.Card.EndTitle =>
  !!unknown && !!(unknown as App.Card.EndTitle).text;

  const endTitleColor = (endTitle: App.Card.EndTitle): string => {
    if (endTitle.color?.startsWith('#')) {
      return endTitle.color;
    }
    if (endTitle.color) {
      return `#${endTitle.color}`;
    }

    return '#DDDDDD';
  };

interface EndTitleProps {
  endTitle?: ReactNode | App.Card.EndTitle;
}

const EndTitle: FunctionComponent<EndTitleProps> = (props) => {
  const { endTitle } = props;

  const onClick = () => {
    if (isEndTitleObject(endTitle) && endTitle.handleClick) {
      endTitle.handleClick(endTitle.text);
    }
  };

  if (isEndTitleObject(endTitle)) {
    return (
      <Pill
        onClick={onClick}
        uppercase
        size="md"
        foreground="black"
        overrideBackground={endTitleColor(endTitle)}
        label={endTitle.text}
      />
    );
  }

  return (
    <Fragment>
      {endTitle}
    </Fragment>
  );
};

export default EndTitle;
