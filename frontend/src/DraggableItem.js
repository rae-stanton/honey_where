import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';

export const DraggableItem = ({ item, children, currentRoomId }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ITEM,
    item: { id: item.id, room_id: currentRoomId },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, {
          ref: drag,
          style: { ...child.props.style, opacity: isDragging ? 0.5 : 1 },
        })
      : child
  );
};

