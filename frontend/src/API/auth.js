import apiClient from ".";

async function login(email, password) {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);

    }   
};


async function signup(name,email, password) {
    try {
        const response = await apiClient.post('/auth/signup', {name, email, password });
        return response.data;
    } catch (error) {
        console.error('Sign Up error:', error);

    }   
};
async function getUser() {
    try {
        const response = await apiClient.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error('Get User error:', error);
    }   
};

async function logout() {
    try {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
    }
}


export { login , signup,logout, getUser};