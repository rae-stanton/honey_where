// import { useDrag } from 'react-dnd';

// const DraggableItem = ({ item, itemType }) => {
//   const { startDragItem } = useDragDropContext();

//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: itemType, // Use the ItemType from your constants
//     item: { id: item.id, type: 'item' },
//     collect: (monitor) => ({
//       isDragging: !!monitor.isDragging(),
//     }),
//     end: (item, monitor) => {
//       const dropResult = monitor.getDropResult();
//       if (item && dropResult) {
//         startDragItem(item);
//       }
//     }
//   }), [item]);

//   return (
//     <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
//       {/* Your item content here */}
//     </div>
//   );
// };
// DraggableItem.js
import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // Make sure this is the correct path to your ItemTypes

export const DraggableItem = ({ item, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ITEM,
    item: { id: item.id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // If children is a single element, clone it. Otherwise, wrap children in a div
  return React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, {
          ref: drag,
          style: { ...child.props.style, opacity: isDragging ? 0.5 : 1 },
        })
      : child
  );
};

