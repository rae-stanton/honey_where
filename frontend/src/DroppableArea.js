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
        onDrop(item, room); // room should contain at least an id property
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div ref={dropRef} className="droppable-area">
      {/* You can put your room content here */}
      {/* children could be a list of DraggableItem components */}
      {children}
    </div>
  );
};

