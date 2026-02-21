import apiClient from ".";

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

export { getRoom };