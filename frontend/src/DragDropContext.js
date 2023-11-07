import React, { createContext, useContext, useState } from "react";
import axios from "axios";

// Create the context
const DragDropContext = createContext();

// Hook to use the context
export const useDragDropContext = () => useContext(DragDropContext);

export const DragDropProvider = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSubroom, setDraggedSubroom] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Function to start dragging an item
  const startDragItem = (item) => setDraggedItem(item);

  // Function to start dragging a subroom
  const startDragSubroom = (subroom) => setDraggedSubroom(subroom);

  // Function to define the drop target
  const defineDropTarget = (target) => setDropTarget(target);

  // Function to update the location of an item
  const updateItemLocation = async (
    item,
    newRoomId,
    newSubroomId,
    newOrder
  ) => {
    const apiUrl = "http://127.0.0.1:5000"; // Your Flask API URL
    const token = localStorage.getItem("access_token"); // Assuming you store the JWT in local storage

    try {
      const response = await axios.patch(
        `${apiUrl}/room-items/${item.room_id}/${item.id}`,
        {
          new_room_id: newRoomId,
          new_subroom_id: newSubroomId,
          new_order: newOrder,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          },
        }
      );

      console.log(response.data.message);
      // TODO: Update the local state to reflect the changes
      // This could involve setting new state that triggers a re-render of your components
    } catch (error) {
      console.error("Error updating item location:", error);
      // TODO: Handle error state, possibly setting an error message in your UI
    }
  };

  // Function to handle the drop of an item
  const onDrop = (item, targetRoom) => {
    if (!item || !targetRoom || !targetRoom.id) return;

    // Clear the drag states
    setDraggedItem(null);
    setDraggedSubroom(null);
    setDropTarget(null);

    // Update the item location using the target room's ID
    updateItemLocation(item, targetRoom.id, null, null);
  };

  // The context value that will be supplied to any descendants of this provider
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

// Make sure to export the provider component
export default DragDropProvider;
