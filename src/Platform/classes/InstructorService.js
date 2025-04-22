import BaseService from "./BaseService";

class InstructorService extends BaseService {
  constructor(URLAPI, token) {
    super(URLAPI, token);
  }

  // get all groups for instructor
  async getAllGroups() {
    return await this.fetchData('/api/groups/get-all-group-by-admin');
  }

  // get group details
  // async getGroupDetails(groupId) {
  //   return await this.fetchData(`/api/groups/${groupId}`);
  // }

  // get tasks for a group
  async getGroupTasks(lectureId, taskId) {
    return await this.fetchData(`/api/lectures/${lectureId}/${taskId}/get-user-tasks-in-group`);
  }

  // get student attendance in a group
  async getStudentAttendance(studentId, groupId) {
    return await this.fetchData(`/api/lecture/${groupId}/get-lecture-attendance-details`);
  }

  // get student tasks submissions
  async getStudentTaskSubmissions(studentId, groupId) {
    return await this.fetchData(`/api/tasks/student/${studentId}/group/${groupId}/submissions`);
  }

  // get Students
  async getStudents(groupId) {
    return await this.fetchData(`/api/users/all-users`);
  }

  // get Student Details
  async getStudentDetails(studentId) {
    return await this.getDetails(`/api/users/${studentId}`);
  }
  async  updateStudentStatus(userId,stutas,groupId){
    return await this.updateData(`/api/users/set-role-to-${stutas == "approved" ? "pending" : "approved"}/${userId}/${groupId}` ,{status:stutas})
 
  }
  async getStudentAttendance(userId,groupId) {
 
      return await this.axiosInstance.get(`/api/lectures/${userId}/${groupId}/attendance-by-admin`)

  
  }
  async getGroupTasks(userId,groupId) {
      return await this.axiosInstance.get(`/api/lectures/${userId}/${groupId}/get-user-tasks-in-group`)
  
  }

  async getStudentDetailsByGroupId(groupId) {
    return await this.getDetails(`/api/users/all-users/${groupId}`);
  }
  // send Message to Student
  async sendMessageToStudent(studentId, message) {
    return await this.sendMessage(`/api/messages/${studentId}`, { message });
  }

  // get Lectures
  async getLectures(groupId) {
    return await this.fetchData(`/api/lectures/group/${groupId}`);
  }

  // get Lecture Details
  async getLectureDetails(lectureId) {
    return await this.getDetails(`/api/lectures/${lectureId}`);
  }

  // add Lecture
  async addLecture( lectureData) {
    return await this.addData(`/api/lectures`, lectureData);
  }

  // update Lecture
  async updateLecture(lectureId, lectureData) {
    return await this.updateData(`/api/lectures/${lectureId}`, lectureData);
  }

  // delete Lecture
  async deleteLecture(lectureId) {
    return await this.deleteData(`/api/lectures/${lectureId}`);
  }

  // get Quizzes
  async getQuizzes(groupId) {
    return await this.fetchData(`/api/quizzes/groups/${groupId}`);
  }

  // add Quiz
  async addQuiz( quizData) {
    return await this.addData(`/api/quizzes`, quizData);
  }

  // update Quiz
  async updateQuiz(quizId, quizData) {
    return await this.updateData(`/api/quizzes/${quizId}`, quizData);
  }

  // delete Quiz
  async deleteQuiz(quizId) {
    return await this.deleteData(`/api/quizzes/${quizId}`);
  }

  //get tasks
  async getTasks(groupId) {
    return await this.fetchData(`/api/lectures/groups/${groupId}/tasks`);
  }
  //get submissions task
  async getSubmissionsTask(lectureId, taskId) {
    return await this.fetchData(`/api/lectures/${lectureId}/tasks/${taskId}/submissions`);
  }
  //add task
  async addTask(lectureId, taskData) {
    return await this.addData(`/api/lectures/${lectureId}/create-task`, taskData);
  }
  // update task
  async updateTask(groupId, taskId, taskData) {
    return await this.updateData(`/api/lectures/${groupId}/edit-task/${taskId}`, taskData);
  }
  // delete task
  async deleteTask(lectureId, taskId) {
    return await this.deleteData(`/api/lectures/${lectureId}/tasks/${taskId}`);
  }
}


export default InstructorService; 