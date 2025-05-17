import axios from 'axios';
import Cookies from 'js-cookie';

class InstructorService  {
  constructor(baseURL, token) {
    this.baseURL = import.meta.env.VITE_API_URL || baseURL;
    this.token = token;
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `${this.token}`,
        'Content-Type': 'application/json',
      },
    });

  
    this.axiosInstance.interceptors.response.use(
      res => res,
      async (error) => {
        const originalRequest = error.config;

        // if (
        //   error.message.includes("suspicious") ||
        //   error.response?.status === 403          
        // ) {
        //   this.toggleMaintenanceMode();
        // }

        // ريفريش التوكن
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = Cookies.get("refreshTokenInstructor");
            if (!refreshToken) throw new Error("No refresh token available");

            const response = await this.refreshToken(refreshToken);
            const { accessToken, refreshToken: newRefreshToken } = response;

            localStorage.setItem("tokenInstructor", JSON.stringify(accessToken));
            Cookies.set("refreshTokenInstructor", newRefreshToken, {
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
    localStorage.removeItem("tokenInstructor");
    localStorage.removeItem("tokenExpirationInstructor");
    Cookies.remove("refreshTokenInstructor");
    window.location.href = "/";
  }
  // get all groups for instructor
  async getAllGroups() {
    try {
      const res = await this.axiosInstance.get('/api/groups/get-all-group-by-admin', {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  async getGroupById(groupId) {
    try {
      const res = await this.axiosInstance.get(`/api/groups/get-groupId-by-admin/${groupId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  async updateGroup(groupId, groupData  ) {
    try {
      const res = await this.axiosInstance.put(`/api/groups/${groupId}`, groupData, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  // get tasks for a group
  async getGroupTasks(lectureId, taskId) {
    try {
      const res = await this.axiosInstance.get(`/api/lectures/${lectureId}/${taskId}/get-user-tasks-in-group`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  // get student attendance in a group
  async getStudentAttendance(studentId, groupId) {
    try {
      const res = await this.axiosInstance.get(`/api/lecture/${groupId}/get-lecture-attendance-details`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  // get student tasks submissions
  async getStudentTaskSubmissions(studentId, groupId) {
    try {
      const res = await this.axiosInstance.get(`/api/tasks/student/${studentId}/group/${groupId}/submissions`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  // get Students
  async getStudents(){
    try {
      const res = await this.axiosInstance.get(`/api/users/all-users`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  // get Student Details
  async getStudentDetails(studentId) {
    try {
      const res = await this.axiosInstance.get(`/api/users/${studentId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  async  updateStudentStatus(userId,stutas,groupId){
    try {
      const res = await this.axiosInstance.put(`/api/users/set-role-to-${stutas == "approved" ? "pending" : "approved"}/${userId}/${groupId}`, {
        status: stutas
      }, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  async getStudentAttendance(userId,groupId) {
    try {
      const res = await this.axiosInstance.get(`/api/lectures/${groupId}/${userId}/attendance-by-admin`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  async getStudentDetailsByGroupId(groupId) {
    try {
      const res = await this.axiosInstance.get(`/api/users/all-users/${groupId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  async getPendingUsers(){
    try{
      const response = await this.axiosInstance.get(`/api/users/pending-users`)
      return response.data
    }catch(error){
      throw error;
    }
  } 
  async acceptRequest(status ,acceptData){
    try{
      const response = await this.axiosInstance.post(`/api/users/${status}`,acceptData)
      return response.data
    }catch(error){
      throw error;
    }
  } 
  async rejectRequest(rejectId){
    try{
      const response = await this.axiosInstance.post(`/api/users/reject-join-request`,rejectId)
      return response.data
    }catch(error){
      throw error;
    }
  }
  // send Message to Student
  async sendMessageToStudent( message,groupId) {
    try {
      const res = await this.axiosInstance.post(`/api/users/send-message-to-group/${groupId}`,  message , {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // get all Lectures
  async getLectures(groupId) {
    try {
      const res = await this.axiosInstance.get(`/api/lectures/group/${groupId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // get Lecture Details by id
  async getLectureDetails(lectureId) {
    try {
      const res = await this.axiosInstance.get(`/api/lectures/${lectureId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  //get Lecture Attendance Details
  async getLectureAttendanceDetails(lectureId) {
    try {
      const res = await this.axiosInstance.get(`/api/lectures/${lectureId}/get-lecture-attendance-details`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // add Lecture
  async addLecture( lectureData) {
    try {
      const res = await this.axiosInstance.post(`/api/lectures`, lectureData, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // update Lecture
  async updateLecture(lectureId, lectureData) {
    try {
      const res = await this.axiosInstance.put(`/api/lectures/${lectureId}`, lectureData, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // delete Lecture
  async deleteLecture(lectureId) {
    try {
      const res = await this.axiosInstance.delete(`/api/lectures/${lectureId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // get all Quizzes
  async getQuizzes(groupId) {
    try {
      const res = await this.axiosInstance.get(`/api/quizzes/groups/${groupId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // add Quiz
  async addQuiz( quizData) {
    try {
      const res = await this.axiosInstance.post(`/api/quizzes`, quizData, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // update Quiz
  async updateQuiz(quizId, quizData) {
    try {
      const res = await this.axiosInstance.put(`/api/quizzes/${quizId}`, quizData, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // delete Quiz
  async deleteQuiz(quizId) {
    try {
      const res = await this.axiosInstance.delete(`/api/quizzes/${quizId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  //get tasks
  async getTasks(groupId) {
    try {
      const res = await this.axiosInstance.get(`/api/lectures/groups/${groupId}/tasks`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  //show all quizzes score
  async showAllQuizzesScore(studentId,groupId){
    try {
      const res = await this.axiosInstance.get(`/api/quizzes/${groupId}/${studentId}/detial-score-by-admin`, {
        headers: { Authorization: ` ${this.token}` }
      }); 
      return res.data;
    } catch (error) {
      throw error;
    }
  }


  //get submissions task
  async getSubmissionsTask(lectureId, taskId) {
    try {
      const res = await this.axiosInstance.get(`/api/lectures/${lectureId}/tasks/${taskId}/submissions`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  //add task
  async addTask(lectureId, taskData) {
    try {
      const res = await this.axiosInstance.post(`/api/lectures/${lectureId}/createtasks`, taskData, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // update task
  async updateTask(groupId, taskId, taskData) {
    try {
      const res = await this.axiosInstance.put(`/api/lectures/${groupId}/edit-task/${taskId}`, taskData, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
  // delete task
  async deleteTask(lectureId, taskId) {
    try {
      const res = await this.axiosInstance.delete(`/api/lectures/${lectureId}/tasks/${taskId}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
}


export default InstructorService; 