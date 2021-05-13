import styled from 'styled-components';

export interface NodeSize {
  clientWidth: number;
  clientHeight: number;
}

interface RotatorContainerProps {
  nodeSize: NodeSize;
  side: 'left' | 'right';
  siblingSize: NodeSize;

}

export const RotatorContainer = styled.div<RotatorContainerProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: ${({ nodeSize: { clientWidth } }) => `${clientWidth}px`};
  left: -${({ nodeSize: { clientHeight }, side }) => side === 'left' ? clientHeight : 0}px;
`;

interface RotatorElementProps {
  nodeSize: NodeSize;
  siblingSize: NodeSize;
  side: 'left' | 'right';
}

export const RotatorElement = styled.div<RotatorElementProps>`
  position: absolute;
  transform: rotate(${({ side }) => side === 'left' ? '270' : '90'}deg);
  left: ${({ nodeSize, siblingSize, side }) =>
    side === 'left' ?
    nodeSize.clientHeight / 4 :
    siblingSize.clientWidth - (nodeSize.clientHeight / 2)
  }px;
  top: ${({ nodeSize: { clientWidth } }) => `${clientWidth / 4}px`};
`;

interface RotatorSiblingProps {
  nodeSize: NodeSize;
  side: 'left' | 'right';
}

export const RotatorSibling = styled.div<RotatorSiblingProps>`
  display: flex;
  align-items: center;
  height: 100%;
  margin-left: ${({ nodeSize: { clientHeight }, side }) => side === 'left' ? clientHeight * 2 : 0}px;
`;

export const UnrotatorContainer = styled.div`
`;

export const UnrotatorElement = styled.div`
`;

export const UnrotatorSibling = styled.div`
`;

/**
 * @deprecated
 */
export const RotatorElementOuter = styled.div`
`;
