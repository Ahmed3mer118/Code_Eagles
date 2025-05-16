import axios from 'axios';
import Cookies from 'js-cookie';

class AdminService {
  constructor(baseURL, token, setMaintenanceMode) {
    this.baseURL = import.meta.env.VITE_API_URL || baseURL;
    this.token = token;
    this.isBlocked = false;
    this.setMaintenanceMode = setMaintenanceMode;

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(config => {
      if (this.isBlocked) {
        return Promise.reject(new Error("Blocked due to security issue."));
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      res => res,
      async (error) => {
        const originalRequest = error.config;

        // مثال على حالة تفعيل وضع الصيانة
        if (
          error.message.includes("suspicious") ||
          error.response?.status === 403          
        ) {
          this.toggleMaintenanceMode();
        }

        // ريفريش التوكن
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = Cookies.get("refreshToken");
            if (!refreshToken) throw new Error("No refresh token available");

            const response = await this.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = response;

            localStorage.setItem("token", JSON.stringify(accessToken));
            Cookies.set("refreshToken", newRefreshToken, {
              expires: 7,
              secure: true,
              sameSite: "strict",
            });

            originalRequest.headers.Authorization = `${accessToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            this.handleLogout();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }


  toggleMaintenanceMode(value) {
    this.isBlocked = value;
    this.setMaintenanceMode(value);
  }

  async refreshToken(refreshToken) {
    try {
      const response = await this.axiosInstance.post(`/api/users/refresh-token`, {
        refreshToken: refreshToken
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiration");
    Cookies.remove("refreshToken");
    window.location.href = "/login";
  }

  // Groups Methods
  async getAllGroups() {
    try {
      const response = await this.axiosInstance.get('/api/groups/get-all-group-by-admin');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getGroupDetails(groupId) {
    try {
      const response = await this.axiosInstance.get(`/api/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  async createGroup(groupData) {
    try {
      const response = await this.axiosInstance.post('/api/groups', groupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateGroup(groupId, groupData) {
    try {
      const response = await this.axiosInstance.put(`/api/groups/${groupId}`, groupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteGroup(groupId) {
    try {
      const response = await this.axiosInstance.delete(`/api/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lectures Methods
  async getLectures(groupId) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getLectureDetails(lectureId) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${lectureId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createLecture(lectureData) {
    try {
      const response = await this.axiosInstance.post('/api/lectures', lectureData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateLecture(lectureId, lectureData) {
    try {
      const response = await this.axiosInstance.put(`/api/lectures/${lectureId}`, lectureData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteLecture(lectureId) {
    try {
      const response = await this.axiosInstance.delete(`/api/lectures/${lectureId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tasks Methods
  async getTasks(groupId) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/groups/${groupId}/tasks`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  async createTask(lectureId, taskData) {
    try {
      const response = await this.axiosInstance.post(`/api/lectures/${lectureId}/createtasks`, taskData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await this.axiosInstance.put(`/api/lectures/${lectureId}/edit-task/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await this.axiosInstance.delete(`/api/lectures/${lectureId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getSubmissionsTask(lectureId, taskId) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${lectureId}/tasks/${taskId}/submissions`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  // Quiz Methods
  async getQuizzes(groupId) {
    try {
      const response = await this.axiosInstance.get(`/api/quizzes/groups/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createQuiz(quizData) {
    try {
      const response = await this.axiosInstance.post('/api/quizzes', quizData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateQuiz(quizId, quizData) {
    try {
      const response = await this.axiosInstance.put(`/api/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteQuiz(quizId) {
    try {
      const response = await this.axiosInstance.delete(`/api/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Students Methods
  async getStudents() {
    try {
      const response = await this.axiosInstance.get(`/api/users/all-users`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getStudentDetails(studentId) {
    try {
      const response = await this.axiosInstance.get(`/api/users/${studentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async updateStudentRole(userId,role){
    try{
      const response = await this.axiosInstance.put(`/api/users/${userId}`,{role})
      return response.data
    }catch(error){
      throw this.handleError(error)
    }
  }
  // update Student Status
  async updateStudentStatus(userId,stutas,groupId){
    try{
      const response = await this.axiosInstance.put(`/api/users/set-role-to-${stutas == "approved" ? "pending" : "approved"}/${userId}/${groupId}` ,{status:stutas})
      return response.data
    }catch(error){
      throw this.handleError(error)
    }
  }
   
  async getStudentAttendance(userId,groupId) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${groupId}/${userId}/attendance-by-admin`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }
  async getGroupTasks(userId,groupId) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${userId}/${groupId}/get-user-tasks-in-group`)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async addStudent(studentData) {
    try {
      const response = await this.axiosInstance.post('/api/users/adduser', studentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStudent(studentId, studentData) {
    try {
      const response = await this.axiosInstance.put(`/api/users/${studentId}`, studentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteStudent(studentId) {
    try {
      const response = await this.axiosInstance.delete(`/api/users/${studentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Attendance Methods by admin
  async getAttendance(lectureId) {
    try {
      const response = await this.axiosInstance.get(`/api/lectures/${lectureId}/get-lecture-attendance-details`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markAttendance(attendanceData) {
    try {
      const response = await this.axiosInstance.post('/api/attendance', attendanceData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Messages Methods
  async getMessages(groupId) {
    try {
      const response = await this.axiosInstance.get(`/api/messages/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(messageData) {
    try {
      const response = await this.axiosInstance.post('/api/messages', messageData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMessage(messageId) {
    try {
      const response = await this.axiosInstance.delete(`/api/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Feedback Methods
  async getFeedback() {
    try {
      const response = await this.axiosInstance.get('/api/feedback');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error Handler
  handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
        data: error.response.data
      };
    }
    return {
      status: 500,
      message: 'Network error or server is not responding',
      error: error.message
    };
  }
}

export default AdminService; 