import axios, { AxiosInstance } from "axios";
import AuthServices from "./Auth";

class UserService {
  private URLAPI: string;
  private token: string;
  private axiosInstance: AxiosInstance;
  private authService: AuthServices;

  constructor(token: string) {
    this.URLAPI = import.meta.env.VITE_API_URL;
    this.token = token;
    this.authService = new AuthServices();
    
    // Use the enhanced axios instance from AuthServices
    this.axiosInstance = this.authService.getAxiosInstance();
    
    // Update the authorization header with the current token
    if (token) {
      this.axiosInstance.defaults.headers["Authorization"] = token;
    }
  }

  // Update token method for when token changes
  updateToken(newToken: string) {
    this.token = newToken;
    this.axiosInstance.defaults.headers["Authorization"] = newToken;
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

  async getTasks(groupId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/groups/${groupId}/tasks`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getTaskById(lectureId: string, taskId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${lectureId}/tasks/${taskId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async submitTask(lectureId: string, taskId: string, taskData: any) {
    try {
      const response = await this.axiosInstance.post(`/api/lectures/${lectureId}/submit-task/${taskId}`, taskData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getQuizzes(groupId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/groups/${groupId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
  
  async getQuizzesByLectureId(slugLec: string) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/lecture/${slugLec}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getQuizById(quizId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/${quizId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async submitQuiz(quizId: string, quizData: any) {
    try {
      const response = await this.axiosInstance.post(`/api/quizzes/${quizId}/submit`, quizData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getQuizResult(quizId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/${quizId}/result`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
  async getScore(slug: string) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/score/${slug}`);
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


  async getMessages(groupId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/messages/group/${groupId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async sendMessage(messageData: any) {
    try {
      const response = await this.axiosInstance.post(`/api/messages`, messageData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async deleteMessage(messageId: string) {
    try {
      const response = await this.axiosInstance.delete(`/api/messages/${messageId}`);
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

  async submitFeedback(feedbackData: any) {
    try {
      const response = await this.axiosInstance.post(`/api/feedback`, feedbackData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getAttendance(lectureId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${lectureId}/get-user-attendance-status-in-group`);
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

  async markAttendance(attendanceData: any) {
    try {
      const response = await this.axiosInstance.post(`/api/attendance`, attendanceData);
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

  async markNotificationAsRead(notificationId: string) {
    try {
      const response = await this.axiosInstance.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getProfile() {
    try {
      const response = await this.axiosInstance.get(`/api/users/profile`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async updatePassword(passwordData: any) {
    try {
      const response = await this.axiosInstance.put(`/api/users/password`, passwordData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getCourseProgress(groupId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/users/groups/${groupId}/progress`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getTaskSubmissions(lectureId: string, taskId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${lectureId}/tasks/${taskId}/submissions`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  async getQuizResults(groupId: string) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/groups/${groupId}/results`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}

export default UserService;
