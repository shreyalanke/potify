import apiClient from ".";

async function createRoom() {
    try {
        const response = await apiClient.get(`/rooms`);
        return response.data;
    } catch (error) {
        console.error("Error creating room:", error);
        return null;
    }
}

async function getRoom(roomId) {
    try {
        if(roomId){
            const response = await apiClient.get(`/rooms/${roomId}`);
            return response.data;
        }else{
            const response = await apiClient.get(`/rooms`);
            return response.data;
        }
    } catch (error) {
        console.error("Error fetching room details:", error);
        return null;
    }
}

async function leaveRoom(roomId) {
    try {
        const response = await apiClient.post(`/rooms/${roomId}/leave`);
        return response.data;
    } catch (error) {
        console.error("Error leaving room:", error);
        return null;
    }
}

export { createRoom, getRoom, leaveRoom };