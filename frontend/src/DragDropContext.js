import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const DragDropContext = createContext();

export const useDragDropContext = () => useContext(DragDropContext);

export const DragDropProvider = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSubroom, setDraggedSubroom] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const startDragItem = (item) => setDraggedItem(item);
  const startDragSubroom = (subroom) => setDraggedSubroom(subroom);
  const defineDropTarget = (target) => setDropTarget(target);

  const updateItemLocation = async (item, newRoomId, newSubroomId, newOrder) => {
    const apiUrl = 'http://127.0.0.1:5000'; // Your Flask API URL
    const token = localStorage.getItem('access_token'); // Assuming you store the JWT in local storage

    try {
      const response = await axios.patch(`${apiUrl}/room-items/${item.room_id}/${item.id}`, {
        new_room_id: newRoomId,
        new_subroom_id: newSubroomId,
        new_order: newOrder
      }, {
        headers: {
          Authorization: `Bearer ${token}` // Add the token to the Authorization header
        }
      });

      console.log(response.data.message);
      // Here you can also update the local state to reflect the changes

    } catch (error) {
      console.error("Error updating item location:", error);
    }
  };

  const onDrop = (item, target) => {
    // Clear the drag states
    setDraggedItem(null);
    setDraggedSubroom(null);
    setDropTarget(null);

    // Call the updateItemLocation with the necessary parameters
    // For example, if dropping an item into a new room:
    if (item && target && target.type === 'room') {
      updateItemLocation(item, target.id, null, null); // Assuming target.id is the new room's ID
    }

    // If dropping into a new subroom, you would pass the subroom ID as the second argument
    // If you also need to update the order, pass the new order index as the third argument
  };

  const contextValue = {
    draggedItem,
    draggedSubroom,
    dropTarget,
    startDragItem,
    startDragSubroom,
    defineDropTarget,
    onDrop,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
};

export default DragDropProvider;
