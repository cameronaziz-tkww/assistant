import { useIsHovered } from '@hooks';
import React, { FunctionComponent, MouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { render } from 'react-dom';
import tippy, { Instance, Placement } from 'tippy.js/headless';
import * as Styled from './styled';
import Tip from './tip';

export interface TooltipProps extends Styled.TooltipTextProps, Styled.ContainerProps, Styled.StyledTooltipProps {
  text: string | ReactNode;
  isDisabled?: boolean;
  noDelay?: boolean;
  showDelay?: number;
  hideDelay?: number;
  placement?: Placement;
  onClick?(event: MouseEvent<HTMLDivElement>): void;
}

const Tooltip: FunctionComponent<TooltipProps> = (props) => {
  const { children, showDelay, hideDelay, inline, marginY, truncate, placement, isDisabled, cursorType } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<Instance | null>(null);
  const [containerHovered, setContainerHovered] = useState(false);
  const [tipHovered, setTipHovered] = useState(false);
  useIsHovered({ ref, onChange: setContainerHovered });

  const handleTipHover = (nextHoverState: boolean) => {
    if (nextHoverState) {
      setTimeout(
        () => {
          setTipHovered(nextHoverState);
        },
        showDelay || 0,
      );
      return;
    }
    setTimeout(
      () => {
        setTipHovered(nextHoverState);
      },
      hideDelay || 0,
    );
  };

  useEffect(
    () => {
      const nextInstance = ref.current ?
        tippy(
          ref.current,
          {
            delay: [showDelay || null, hideDelay || null],
            placement: placement || 'bottom',
            content: 'content',
            render() {
              const popper = document.createElement('div');
              const box = document.createElement('div');

              render(
                <Tip {...props} handleHover={handleTipHover} isNotHovered={!containerHovered && !isDisabled} />,
                box,
              );

              popper.appendChild(box);

              return {
                popper,
              };
            },
            allowHTML: true,
          },
        ) :
        null;

      setInstance(nextInstance);

      return () => {
        if (nextInstance) {
          nextInstance.destroy();
        }
      };
    },
    [ref.current, containerHovered, hideDelay, showDelay, tipHovered],
  );

  useEffect(
    () => {
      if (instance) {
        if (containerHovered) {
          setTimeout(
            () => {
              if (!instance.state.isDestroyed) {
                instance.show();
              }
            },
            showDelay || 0,
          );
          return;
        }

        setTimeout(
          () => {
            if (!instance.state.isDestroyed) {
              instance.hide();
            }
          },
          hideDelay || 0,
        );
      }
    },
    [instance, containerHovered, tipHovered],
  );

  if (isDisabled) {
    return (
      <Styled.Container truncate={truncate} cursorType={cursorType}>
        {children}
      </Styled.Container>
    );
  }

  return (
    <Styled.Container
      ref={ref}
      cursorType={cursorType}
      truncate={truncate}
      inline={inline}
      marginY={marginY}
    >
      {children}
    </Styled.Container>
  );
};

export default Tooltip;
