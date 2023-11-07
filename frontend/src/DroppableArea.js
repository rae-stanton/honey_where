import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // This should be the constant defining your draggable types

export const DroppableArea = ({ room, onDrop }) => {
  const [, drop] = useDrop({
    accept: ItemTypes.ITEM, // Assuming ITEM is a valid type from your ItemTypes
    drop: (item, monitor) => {
      if (monitor.isOver()) {
        onDrop(item, room);
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop}>
      {/* Room content */}
      {/* This is where you map over the items in the room to create DraggableItem components */}
    </div>
  );
};
