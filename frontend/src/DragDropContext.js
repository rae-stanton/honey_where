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

const updateRoomState = (item, newRoomId, newSubroomId) => {
  setNewRoom((prevRoomState) => {
    const updatedRooms = prevRoomState.map((room) => {
      // Remove the item from its current location
      if (room.id === item.room_id) {
        const updatedItems = room.items.filter((i) => i.id !== item.id);
        const updatedSubrooms = room.subrooms.map((subroom) => {
          const updatedSubItems = subroom.items.filter((i) => i.id !== item.id);
          return { ...subroom, items: updatedSubItems };
        });
        return { ...room, items: updatedItems, subrooms: updatedSubrooms };
      }

      // Add the item to the new location
      if (room.id === newRoomId) {
        // If the item is moved to a room
        if (!newSubroomId) {
          const updatedItems = [...room.items, { ...item, room_id: newRoomId }];
          return { ...room, items: updatedItems };
        }

        // If the item is moved to a subroom
        const updatedSubrooms = room.subrooms.map((subroom) => {
          if (subroom.id === newSubroomId) {
            const updatedSubItems = [...subroom.items, { ...item, subroom_id: newSubroomId }];
            return { ...subroom, items: updatedSubItems };
          }
          return subroom;
        });
        return { ...room, subrooms: updatedSubrooms };
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

  const patchUrl = item.room_id
    ? `${apiUrl}/update-item-location/${item.id}` // For room
    : `${apiUrl}/update-item-location/${item.id}`; // For subroom, it's the same endpoint

  try {
    const response = await axios.patch(
      patchUrl,
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
      updateRoomState(item, newRoomId, newSubroomId);
      onSuccess && onSuccess(item, newRoomId, newSubroomId);
    }
  } catch (error) {
    console.error("Error updating item location:", error);
  }
};



const onDrop = (item, target, targetType, onSuccess) => {
  if (!item || !target) return;

  setDraggedItem(null);
  setDraggedSubroom(null);
  setDropTarget(null);

  if (targetType === 'room') {
    updateItemLocation(
      { ...item, room_id: item.currentRoomId },
      target.id,
      null,
      null,
      onSuccess
    );
  } else if (targetType === 'subroom') {
    updateItemLocation(
      { ...item, subroom_id: item.currentSubroomId },
      target.roomId,
      target.id,
      null,
      onSuccess
    );
  }
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

export default DragDropProvider;
