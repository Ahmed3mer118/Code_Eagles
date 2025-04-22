import axios from 'axios';

class AdminService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `${this.token}`,
        'Content-Type': 'application/json',
      },
    });
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
      const response = await this.axiosInstance.get(`/api/lectures/${userId}/${groupId}/attendance-by-admin`)
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

  // Attendance Methods
  async getAttendance(lectureId) {
    try {
      const response = await this.axiosInstance.get(`/api/attendance/lecture/${lectureId}`);
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