import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const DragDropContext = createContext();

export const useDragDropContext = () => useContext(DragDropContext);

export const DragDropProvider = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedSubroom, setDraggedSubroom] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [newRoom, setNewRoom] = useState([]);

  const startDragItem = (item) => setDraggedItem(item);

  const startDragSubroom = (subroom) => setDraggedSubroom(subroom);

  const defineDropTarget = (target) => setDropTarget(target);

  const updateRoomState = (item, newRoomId) => {
    setNewRoom((prevRoomState) => {
      const updatedRooms = prevRoomState.map((room) => {
        if (room.id === item.room_id) {
          return { ...room, items: room.items.filter((i) => i.id !== item.id) };
        } else if (room.id === newRoomId) {
          return { ...room, items: [...room.items, { ...item, room_id: newRoomId }] };
        }
        return room;
      });
      return updatedRooms;
    });
  };

  const updateItemLocation = async (
    item,
    newRoomId,
    newSubroomId,
    newOrder,
    onSuccess
  ) => {
    const apiUrl = "http://127.0.0.1:5000";
    const token = localStorage.getItem("access_token");

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
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data.message);
      if (response.status === 200) {
        updateRoomState(item, newRoomId)
        onSuccess && onSuccess(item, newRoomId);

      }

    } catch (error) {
      console.error("Error updating item location:", error);

    }
  };


  const onDrop = (item, targetRoom, onSuccess) => {
    if (!item || !targetRoom || !targetRoom.id) return;

    // Clear the drag states
    setDraggedItem(null);
    setDraggedSubroom(null);
    setDropTarget(null);

    updateItemLocation(
      { ...item, room_id: item.room_id },
      targetRoom.id,
      null,
      null,
      onSuccess
    );
  };

  const contextValue = {
    draggedItem,
    draggedSubroom,
    dropTarget,
    startDragItem,
    startDragSubroom,
    defineDropTarget,
    newRoom,
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
