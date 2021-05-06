import React, { CSSProperties, Fragment, FunctionComponent, useEffect, useRef, useState } from 'react';

interface AnimateHeightProps {
  shouldRenderSpaceAfter?: boolean;
  shouldChange?: boolean;
  handleTransitionEnd?(): void;
  style?: CSSProperties;
  className?: string;
  id?: App.ShouldDefineType;
  callback?(transition: number, id?: App.ShouldDefineType): void;
}

const AnimateHeight: FunctionComponent<AnimateHeightProps> = (props) => {
  const { shouldRenderSpaceAfter, callback, className, style, id, children, handleTransitionEnd, shouldChange } = props;
  const [initialHeight, setInitialHeight] = useState(0);
  const [selectedHeight, setSelectedHeight] = useState(0);
  const [displayDiv, setDisplayDiv] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const outerContentRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (contentRef.current) {
        if (shouldChange) {
          const { clientHeight } = contentRef.current;
          setSelectedHeight(clientHeight);
          setDisplayDiv(true);
          if (callback) {
            const transition = clientHeight - initialHeight;
            callback(transition, id);
          }
          return;
        }

        if (callback) {
          callback(0, id);
        }
        if (shouldRenderSpaceAfter) {
          setDisplayDiv(false);
        }
      }
    },
    [shouldChange, contentRef],
  );

  useEffect(
    () => {

      if (contentRef.current) {
        setInitialHeight(contentRef.current.clientHeight);
        setDisplayDiv(true);
      }

      window.addEventListener('transitionend', transitionEnd);
      window.addEventListener('load', adjustContent);

      return () => {
        window.removeEventListener('transitionend', transitionEnd);
        window.removeEventListener('load', adjustContent);
      };
    },
    [contentRef],
  );

  const adjustContent = () => {
    const { current } = contentRef;
    if (!current) {
      return;
    }

    if (shouldChange) {
      setSelectedHeight(current.clientHeight);
      return;
    }

    setInitialHeight(current.clientHeight);
  };

  const transitionEnd = () => {
    if (handleTransitionEnd) {
      handleTransitionEnd();
    }
  };

  const getScale = () => {
    if (!shouldChange) {
      return 1;
    }
    return selectedHeight / initialHeight;
  };

  const getStyle = (): CSSProperties => ({
    position: 'absolute',
    top: '0',
    right: '0',
    left: '0',
    bottom: '0',
    backgroundColor: '#fff',
    transition: 'transform 0.5s ease-in-ou',
    transform: `scaleY(${getScale()})`,
    transformOrigin: 'center top',
    zIndex: -1000,
    ...style,
  });

  const getHeight = () => {
    if (initialHeight) {
      return `${initialHeight}px`;
    }
    return '100%';
  };

  const renderSpaceAfter = () => {
    if (displayDiv) {
      return (
        <div
          style={{
            height: `${selectedHeight - initialHeight}px`,
          }}
        />
      );
    }
  };

  const height = getHeight();
  const styles = getStyle();

  return (
    <Fragment>
      <div
        style={{
          position: 'relative',
          height: height,
          width: '100%',
        }}
        ref={outerContentRef}
      >
        <div style={styles} className={className} />
        <div ref={contentRef}>
          {children}
        </div>
      </div>
      {shouldRenderSpaceAfter && renderSpaceAfter()}
    </Fragment>
  );
};

export default AnimateHeight;