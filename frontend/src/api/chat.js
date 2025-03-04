import { axiosInstance } from "../config/axios";

class Chat {
    async getSideBarUsers() {
        try {
            const response = await axiosInstance.get("/api/v1/messages/users");
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    async getMessages(id) {
        try {
            const response = await axiosInstance.get(`/api/v1/messages/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    async sendMessage(currentUserId, text, image = null) {
        try {
            const formData = new FormData();
            formData.append("text", text);
            formData.append("image", image);
            const response = await axiosInstance.post(`/api/v1/messages/send/${currentUserId}`, formData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

const chat = new Chat();

export default chat;