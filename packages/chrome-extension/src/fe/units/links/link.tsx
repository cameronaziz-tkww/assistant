import { links } from '@context';
import { uuid } from '@utils';
// import { Identifier } from 'dnd-core';
import React, { FunctionComponent, useRef } from 'react';
import SVGLink from './svgLink';
import TextLink from './textLink';

interface StandardLinkProps {
  id: string;
  isFocused: boolean
}

// interface DropCollectedProps {
//   handlerId: Identifier | null
// }

// interface DragCollectedProps {
//   isDragging: boolean;
// }

// interface DragItem {
//   sourcePosition: number;
// }

// interface DropItem {
// }

const getLink = (id: string, standard: App.Links.StandardBuiltConfig[], custom: App.Links.CustomConfig[]): App.Links.Config | null => {
  const standardLink = standard.find((link) => link.id === id);
  if (standardLink) {
    return {
      type: 'standard',
      link: standardLink,
    };
  }
  const customLink = custom.find((link) => link.id == id);
  if (customLink) {
    return {
      type: 'custom',
      link: customLink,
    };
  }

  return null;
};

const isStandardLink = (type: string, unknown: App.Links.CustomConfig | App.Links.StandardBuiltConfig): unknown is App.Links.StandardBuiltConfig => type === 'standard';
// const isCustomLink = (type: string, unknown: App.Links.CustomConfig | App.Links.StandardConfig): unknown is App.Links.CustomConfig => type === 'custom';

const Link: FunctionComponent<StandardLinkProps> = (props) => {
  const { id, isFocused } = props;
  const { standard, custom } = links.useTrackedState();
  const linkConfig = getLink(id, standard, custom);

  // const { selection } = useContext(SettingsModalContext);
  const handlerId = uuid();

  const ref = useRef<HTMLDivElement>(null);
  const isDragging = false;

  // const [{ handlerId }, drop] = useDrop<DragItem, DropItem, DropCollectedProps>({
  //   accept: DragItemTypes.LINK,
  //   collect: (monitor) => ({
  //     handlerId: monitor.getHandlerId(),
  //   }),
  //   hover: (item: DragItem, monitor: DropTargetMonitor) => {
  //     if (!ref.current) {
  //       return;
  //     }

  //     const dragIndex = item.sourcePosition;
  //     const hoverIndex = position;

  //     if (dragIndex === hoverIndex) {
  //       return;
  //     }

  //     const hoverBoundingRect = ref.current?.getBoundingClientRect();
  //     const size = hoverBoundingRect.bottom - hoverBoundingRect.top;
  //     const hoverMiddleY = size / 2;
  //     const clientOffset = monitor.getClientOffset();
  //     const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

  //     if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
  //       return;
  //     }

  //     if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
  //       return;
  //     }

  //     // reorder(dragIndex, hoverIndex, item.sourcePosition);
  //   },
  // });

  // const [{ isDragging }, drag] = useDrag<DragItem, DropItem, DragCollectedProps>({
  //   type: DragItemTypes.LINK,
  //   item: () => ({
  //     sourcePosition: link.position,
  //   }),
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  //   canDrag: selection === 'save',
  // });

  // drag(drop(ref));

  if (!linkConfig) {
    return null;
  }

  const { link, type } = linkConfig;
  if (isStandardLink(type, link) && link.buttonChoice === 'icon') {
    return (
      <SVGLink
        ref={ref}
        link={link}
        isFocused={isFocused}
        handlerId={handlerId}
        isDragging={isDragging}
      />
    );
  }

  return (
    <TextLink
      ref={ref}
      isFocused={isFocused}
      linkConfig={linkConfig}
      handlerId={handlerId}
      isDragging={isDragging}
    />
  );
};

export default Link;
