import React, { ReactNode, forwardRef, useImperativeHandle, ReactElement, useState, useRef, useEffect } from 'react';
import * as Styled from './styled';
import { useWhyDidYouUpdate } from '@hooks';

interface RotatorProps {
  noRotate?: boolean;
  leftNode?: ReactNode;
  rightNode?: ReactNode;
  sibling?: ReactNode;
}

export const defaultNodeSize = {
  clientWidth: 0,
  clientHeight: 0,
}

type NodeSize = Styled.NodeSize
export {
  NodeSize
}

export interface RotatorRef {
  getFullSize(): NodeSize;
  getSiblingSize(): NodeSize;
}


const Rotator = forwardRef<RotatorRef, RotatorProps>((props, ref) => {
  useWhyDidYouUpdate('Rotator', props);
  const { noRotate, rightNode, leftNode, sibling } = props;
  const leftNodeRef = useRef<HTMLDivElement>(null);
  const siblingRef = useRef<HTMLDivElement>(null);
  const rightNodeRef = useRef<HTMLDivElement>(null);
  const [leftNodeSize, setLeftNodeSize] = useState(defaultNodeSize);
  const [siblingSize, setSiblingSize] = useState(defaultNodeSize);
  const [rightNodeSize, setRightNodeSize] = useState(defaultNodeSize);

  const baseSide = leftNode ? 'left' : 'right';
  const baseNode = {
    clientWidth: Math.max(leftNodeSize.clientWidth, rightNodeSize.clientWidth),
    clientHeight: Math.max(leftNodeSize.clientHeight, rightNodeSize.clientHeight),
  };

  useEffect(
    () => {
      if (leftNodeRef.current) {
        const { clientWidth, clientHeight } = leftNodeRef.current
        setLeftNodeSize({ clientWidth, clientHeight });
      }
    },
    [leftNodeRef.current],
  );

  useEffect(
    () => {
      if (siblingRef.current) {
        const { clientWidth, clientHeight } = siblingRef.current
        setSiblingSize({ clientWidth, clientHeight });
      }
    },
    [siblingRef.current],
  );

  useEffect(
    () => {
      if (rightNodeRef.current) {
        const { clientWidth, clientHeight } = rightNodeRef.current
        setRightNodeSize({ clientWidth, clientHeight });
      }
    },
    [rightNodeRef.current],
  );

  useImperativeHandle(ref, () => ({
    getFullSize: () => ({
      clientWidth: baseNode.clientHeight + siblingSize.clientWidth,
      clientHeight: Math.max(baseNode.clientWidth, siblingSize.clientHeight),
    }),
    getSiblingSize: () => ({
      clientWidth: siblingSize.clientWidth,
      clientHeight: siblingSize.clientHeight,
    })
  }));

  if (noRotate) {
    return (
      <Styled.UnrotatorContainer>
        {leftNode &&
          <Styled.UnrotatorElement>
            {leftNode}
          </Styled.UnrotatorElement>
        }
        <Styled.UnrotatorSibling>
          {sibling || null}
        </Styled.UnrotatorSibling>
        {rightNode &&
          <Styled.UnrotatorElement>
            {rightNode}
          </Styled.UnrotatorElement>
        }
      </Styled.UnrotatorContainer>
    );
  }

  return (
    <Styled.RotatorContainer
      nodeSize={baseNode}
      siblingSize={siblingSize}
      side={baseSide}
    >
       {leftNode &&
        <Styled.RotatorElement
          ref={leftNodeRef}
          nodeSize={leftNodeSize}
          side="left"
          siblingSize={siblingSize}
        >
          {leftNode}
        </Styled.RotatorElement>
      }
      {sibling &&
        <Styled.RotatorSibling
          ref={siblingRef}
          nodeSize={baseNode}
          side={baseSide}
        >
          {sibling}
        </Styled.RotatorSibling>
      }
       {rightNode &&
        <Styled.RotatorElementOuter>
          <Styled.RotatorElement
            ref={rightNodeRef}
            nodeSize={rightNodeSize}
            side="right"
            siblingSize={siblingSize}
          >
            {rightNode}
          </Styled.RotatorElement>
        </Styled.RotatorElementOuter>
      }
    </Styled.RotatorContainer>
  );
});

export default Rotator;
