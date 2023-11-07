import React from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { useDragDropContext } from './DragDropContext';

export const DroppableArea = ({ room, children }) => {
  const { onDrop } = useDragDropContext();

  const [, dropRef] = useDrop({
    accept: ItemTypes.ITEM,
    drop: (item, monitor) => {
      if (monitor.isOver()) {
        onDrop(item, room);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div ref={dropRef} className="droppable-area">
      {children}
    </div>
  );
};

