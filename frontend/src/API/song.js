import apiClient from ".";

async function getSongs() {
    try {
        const response = await apiClient.get('/songs');
        return response.data;
    } catch (error) {
        console.error('Get Songs error:', error);
    }   
};

export { getSongs };