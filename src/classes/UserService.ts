import axios, { AxiosInstance } from "axios";

class UserService {
  private URLAPI: string;
  private token: string;
  private axiosInstance: AxiosInstance;

  constructor(token: string) {
    this.URLAPI = import.meta.env.VITE_API_URL;
    this.token = token;
    this.axiosInstance = axios.create({
      baseURL: this.URLAPI,
      headers: {
        "Content-Type": "application/json",
        Authorization: this.token,
      },
        withCredentials: true 
    });
  }

  async deleteAccount() {
    try {
      const response = await this.axiosInstance.delete(`/api/users`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getUserById() {
    try {
      const response = await this.axiosInstance.get(`/api/users`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async updateProfile( profileData: any) {
    try {
      const response = await this.axiosInstance.put(`/api/users`, profileData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
  async deleteUser(){
    try {
      const response = await this.axiosInstance.delete(`/api/user`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
  async getGroups() {
    try {
      const response = await this.axiosInstance.get(`/api/groups`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getGroupById(slug: string) {
    try {
      const response = await this.axiosInstance.get(`/api/groups/${slug}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async joinGroupRequest(joinRes: any) {
    try {
      const response = await this.axiosInstance.post(`/api/users/joinGroupRequest`, joinRes);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async leaveGroup(groupSlug: string) {
    try {
      const response = await this.axiosInstance.post(`/api/users/leave-group`, { groupSlug });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getLectures(groupId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/group/${groupId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getLectureById(lectureId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${lectureId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getUserAttendanceStatusInGroup(groupId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${groupId}/get-user-attendance-status-in-group`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async attendLecture(slugLec: string, code: string) {
    try {
      const response = await this.axiosInstance.post(`/api/lectures/attend`, { slugLec, code });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async submitTask(slugLec: string, slugTask: string, taskData: any) {
    try {
      const response = await this.axiosInstance.post(`/api/lectures/${slugLec}/submit-task/${slugTask}`, taskData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getQuizzesByLectureId(slugLecture: string) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/lecture/${slugLecture}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getQuizById(slugQuiz: string) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/${slugQuiz}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async solveQuiz(slugQuiz: string, answers: any) {
    try {
      const response = await this.axiosInstance.post(`/api/quizzes/solve`, { slugQuize:slugQuiz, answers });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getScore(slugQuiz: string) {
    try { 
      const response = await this.axiosInstance.get(`/api/quizzes/score/${slugQuiz}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getNotifications() {
    try {
      const response = await this.axiosInstance.get(`/api/notifications`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getChats() {
    try {
      const response = await this.axiosInstance.get(`/api/chats`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async submitFeedback(feedbackData: any) {
    try {
      const response = await this.axiosInstance.post(`/api/feedback`, feedbackData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getFeedback() {
    try {
      const response = await this.axiosInstance.get(`/api/feedback`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async contactUs(contactData: any) {
    try {
      const response = await this.axiosInstance.post(`/api/contact/contact-us`, contactData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}

export default UserService;
