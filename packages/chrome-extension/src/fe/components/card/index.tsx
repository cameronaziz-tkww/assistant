import React, { forwardRef, PropsWithChildren, ReactNode } from 'react';
import EndFooter from './endFooter';
import EndTitle from './endTitle';
import * as Styled from './styled';
import Title from './title';

interface CardProps extends Styled.ContentProps {
  title?: App.Card.Title;
  centerTitle?: ReactNode | string;
  endTitle?: ReactNode | App.Card.EndTitle;
  footer?: ReactNode;
  endFooter?: App.Card.EndFooter;
  isDisabled?: boolean;
}

const Card = forwardRef<HTMLDivElement, PropsWithChildren<CardProps>>((props, ref) => {
  const { children, isDisabled, title, contentSize, contentDisplay, contentColumns, centerTitle, endTitle, footer, endFooter } = props;

  return (
    <Styled.Container ref={ref} isDisabled={isDisabled}>
      <Styled.Heading>
        {title && <Title title={title} />}
        {centerTitle &&
          <Styled.CenterTitle>
            {centerTitle}
          </Styled.CenterTitle>
        }
        <EndTitle endTitle={endTitle} />
      </Styled.Heading>
      <Styled.Content
        contentColumns={contentColumns}
        contentDisplay={contentDisplay}
        contentSize={contentSize}
      >
        {children}
      </Styled.Content>
      <Styled.Footer>
        {footer || ''}
        {endFooter && <EndFooter endFooter={endFooter} />}
      </Styled.Footer>
    </Styled.Container>
  );
});

export default Card;

