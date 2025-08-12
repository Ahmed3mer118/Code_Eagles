import axios, { AxiosInstance } from "axios";

class InstructorService {
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
      withCredentials: true,
    });
  }

  // Groups Methods
  async getAllGroups() {
    try {
      const response = await this.axiosInstance.get(
        "/api/groups/get-all-group-by-admin"
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getGroupDetails(slug: string) {
    try {
      const response = await this.axiosInstance.get(`/api/groups/get-groupId-by-admin/${slug}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createGroup(groupData: any) {
    try {
      const response = await this.axiosInstance.post("/api/groups", groupData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateGroup(slug: string, groupData: any) {
    try {
      const response = await this.axiosInstance.put(
        `/api/groups/${slug}`,
        groupData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleGroupStatus(slug: any) {
    try {
      const response = await this.axiosInstance.delete(
        `/api/groups/${slug}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Lectures Methods
  async getLectures(groupSlug: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/group/${groupSlug}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getLectureDetails(slugLec: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/${slugLec}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createLecture(lectureData: any) {
    try {
      const response = await this.axiosInstance.post(
        "/api/lectures",
        lectureData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateLecture(slugLec: string, lectureData: any) {
    try {
      const response = await this.axiosInstance.put(
        `/api/lectures/${slugLec}`,
        lectureData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleLectureStatus(slugLec: string) {
    try {
      const response = await this.axiosInstance.delete(
        `/api/lectures/${slugLec}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tasks Methods
  async getTasks(slug: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/groups/${slug}/tasks`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getTask(slugLec: string, slugTask: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/${slugLec}/tasks/${slugTask}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  async createTask(lectureId: string, taskData: any) {
    try {
      const response = await this.axiosInstance.post(
        `/api/lectures/${lectureId}/createtasks`,
        taskData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTask(slugLec: string, slugTask: string, taskData: any) {
    try {
      const response = await this.axiosInstance.put(`/api/lectures/${slugLec}/edit-task/${slugTask}`, taskData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTask(slugLec: string, taskSlug: string) {
    try {
      const response = await this.axiosInstance.delete(`/api/lectures/${slugLec}/tasks/${taskSlug}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getSubmissionsTask(slugLec: string, slugTask: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/${slugLec}/tasks/${slugTask}/submissions`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async addScoreForStd(slugLec: string, slugTask: string, email: string, evaluationData:any) {
    try {
      const response = await this.axiosInstance.put(
        `/api/lectures/${slugLec}/tasks/${slugTask}/submissions/${email}/evaluate`,evaluationData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Quiz Methods
  async getQuizzes(groupSlug: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/quizzes/groups/${groupSlug}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getQuiz(slugQuiz: string) {
    try {
      const response = await this.axiosInstance.get(
        `api/quizzes/${slugQuiz}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  async createQuiz(quizData: string) {
    try {
      const response = await this.axiosInstance.post("/api/quizzes", quizData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateQuiz(quizId: string, quizData: any) {
    try {
      const response = await this.axiosInstance.put(
        `/api/quizzes/${quizId}`,
        quizData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteQuiz(quizId: string) {
    try {
      const response = await this.axiosInstance.delete(
        `/api/quizzes/${quizId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getAllScoreByGroupSlug(groupSlug: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/quizzes/get-score-all/${groupSlug}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async showAllQuizzesScore(userId: string, groupId: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/quizzes/${groupId}/${userId}/detial-score-by-admin`
      );
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
  async getStudentInGroup(groupSlug: string) {
    try {
      const response = await this.axiosInstance.get(`/api/users/groups/${groupSlug}/users`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getStudentDetails(studentSlug: string) {
    try {
      const response = await this.axiosInstance.get(`/api/users/${studentSlug}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async updateStudentRole(studentSlug: string, role: string) {
    try {
      const response = await this.axiosInstance.put(`/api/users/${studentSlug}`, {
        role,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // update Student Status
  async updateStudentStatus(studentSlug: string, status: string, groupSlug: string) {
    try {
      const response = await this.axiosInstance.put(

        `/api/users/set-role-user/${studentSlug}/${groupSlug}`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStudentStatusSpecial(studentSlug: string, status: string, groupSlug: string) {
    try {
      const response = await this.axiosInstance.put(
        `/api/users/set-role-special/${studentSlug}/${groupSlug}`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }




  async getStudentAttendance(userId: string, groupId: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/${groupId}/${userId}/attendance-by-admin`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getGroupTasks(userId: string, groupId: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/${userId}/${groupId}/get-user-tasks-in-group`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addStudent(studentData: string) {
    try {
      const response = await this.axiosInstance.post(
        "/api/users/adduser",
        studentData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateStudent(email: string, studentData: any) {
    try {
      const response = await this.axiosInstance.put(
        `/api/users/${email}`,
        studentData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteStudent(email: string) {
    try {
      const response = await this.axiosInstance.delete(
        `/api/users/${email}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getPendingUsers() {
    try {
      const response = await this.axiosInstance.get(`/api/users/pending-users`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Attendance Methods by admin
  async getAttendance(slugLec: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/${slugLec}/attendance`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getNonAttendance(slugLec: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/lectures/${slugLec}/non-attendees`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async acceptRequest(status: string, acceptData: string) {
    try {
      const response = await this.axiosInstance.post(
        `/api/users/${status}`,
        acceptData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async rejectRequest(rejectedReq: string) {
    try {
      const response = await this.axiosInstance.post(
        `/api/users/reject-join-request`,
        rejectedReq
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async markAttendance(attendanceData: string) {
    try {
      const response = await this.axiosInstance.post(
        "/api/attendance",
        attendanceData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Messages Methods
  async getMessages(groupId: string) {
    try {
      const response = await this.axiosInstance.get(
        `/api/messages/group/${groupId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendMessage(messageData: string) {
    try {
      const response = await this.axiosInstance.post(
        "/api/messages",
        messageData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteMessage(messageId: string) {
    try {
      const response = await this.axiosInstance.delete(
        `/api/messages/${messageId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Feedback Methods
  async getFeedback() {
    try {
      const response = await this.axiosInstance.get("/api/feedback");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // MAINTENANCE MODE
  async sendLockCode() {
    try {
      const response = await this.axiosInstance.post(
        "/api/emergency/send-lock-code"
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async verifyLockCode(code: string) {
    try {
      const response = await this.axiosInstance.post(
        "/api/emergency/verify-lock-code",
        { code }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async getLockCode() {
    try {
      const response = await this.axiosInstance.get(
        "/api/emergency/get-emergency-status"
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendUnlockCode() {
    try {
      const response = await this.axiosInstance.post(
        "/api/emergency/send-unlock-code"
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  async verifyUlockCode(code: string) {
    try {
      const response = await this.axiosInstance.post(
        "/api/emergency/verify-unlock-code",
        { code }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllInstrcutor() {
    try {
      const response = await this.axiosInstance.get(
        "/api/users/all-instructors"
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Error Handler
  handleError(error: any) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.message || "An error occurred",
        data: error.response.data,
      };
    }
    return {
      status: 500,
      message: "Network error or server is not responding",
      error: error?.message,
    };
  }
}

export default InstructorService;
