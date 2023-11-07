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
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes'; // This should be the constant defining your draggable types

export const DraggableItem = ({ item }) => {
  // Destructure the isDragging property from the object returned by useDrag's collect function
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.ITEM, // Assuming ITEM is a valid type from your ItemTypes
    item: { id: item.id }, // The data that will be available to the drop targets
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Use isDragging here
  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {item.name}
      {/* Other item content */}
    </div>
  );
};
