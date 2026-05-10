import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function useRoomControls(socket, setSocket, user, room, setRoom, setPlayer, setSearchParams) {
  const navigate = useNavigate();
  const [roles, setRoles] = useState({});

  useEffect(() => {
    if (!room) return;

    // Use roles from server if available, otherwise build from hostId
    if (room.roles) {
      setRoles(room.roles);
    } else {
      const initialRoles = {};
      room.members?.forEach(member => {
        if (member._id === room.hostId) {
          initialRoles[member._id] = "host";
        } else {
          initialRoles[member._id] = "member";
        }
      });
      setRoles(initialRoles);
    }
  }, [room]);

  useEffect(() => {
    if (!socket) return;

    const handleRoleUpdate = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "room_roles_updated") {
        setRoles(message.roles || {});
      }
    };

    const handleUserRemoved = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "you_were_removed") {
        // Clear all room-related state immediately to prevent broken UI
        if (socket) {
          socket.close();
          setSocket(null);
        }
        setRoom(null);
        setPlayer(null);
        setSearchParams({});
        // Navigate after state is cleared
        navigate("/home");
      }
    };

    socket.addEventListener("message", handleRoleUpdate);
    socket.addEventListener("message", handleUserRemoved);

    return () => {
      socket.removeEventListener("message", handleRoleUpdate);
      socket.removeEventListener("message", handleUserRemoved);
    };
  }, [socket, setSocket, setRoom, setPlayer, setSearchParams, navigate]);

  function isHostOrAdmin() {
    return roles[user?.id] === "host" || roles[user?.id] === "admin";
  }

  function isHost() {
    return roles[user?.id] === "host";
  }

  function handleRemoveMember(targetUserId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "remove_member",
          targetUserId: targetUserId,
        })
      );
    }
  }

  function handleRemoveFromQueue(songId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "remove_from_queue",
          songId: songId,
        })
      );
    }
  }

  function handleMakeAdmin(targetUserId) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "make_admin",
          targetUserId: targetUserId,
        })
      );
    }
  }

  return {
    roles,
    isHostOrAdmin,
    isHost,
    handleRemoveMember,
    handleRemoveFromQueue,
    handleMakeAdmin,
  };
}

export default useRoomControls;
