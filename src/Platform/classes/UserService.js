import axios from 'axios';
import Cookies from 'js-cookie';

class UserService {
    constructor(token) {
        this.baseURL = import.meta.env.VITE_API_URL;
        this.token = token;
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                Authorization: `${this.token}`,
                'Content-Type': 'application/json',
            },
        });

        // إضافة interceptor للتعامل مع الأخطاء
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                
                // إذا كان الخطأ 401 ولم نقم بمحاولة تحديث الـ token من قبل
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    
                    try {
                        const refreshToken = Cookies.get("refreshTokenUser");
                        if (!refreshToken) {
                            throw new Error("No refresh token available");
                        }

                        // محاولة تحديث الـ token
                        const response = await this.refreshToken(refreshToken);
                        
                        // تحديث الـ token في localStorage
                        localStorage.setItem("tokenUser", JSON.stringify(response.accessToken));
                        Cookies.set("refreshTokenUser", response.refreshToken, {
                            expires: 7,
                            secure: true,
                            sameSite: "strict",
                        });

                        // تحديث الـ token في الطلب الأصلي
                        originalRequest.headers.Authorization = `${response.accessToken}`;
                        
                        // إعادة الطلب الأصلي
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        console.error("Failed to refresh token:", refreshError);
                        // إذا فشل تحديث الـ token، نقوم بتسجيل الخروج
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
        localStorage.removeItem("tokenUser");
        localStorage.removeItem("tokenExpirationUser");
        Cookies.remove("refreshTokenUser");
        window.location.href = "/login";
    }
      
       // register
    async register(userData) {
        try {
            const response = await this.axiosInstance.post(`/api/users/register`, userData);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    async verifyEmail(email, code) {
        try {
            const response = await this.axiosInstance.post(`/api/users/verify-email`, { email, code });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }   
    }

    // login    
    async login(email, password) {
        try {
            const response = await this.axiosInstance.post(`/api/users/login`, {
                email,
                password
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    // forgot password
    async forgotPassword(email) {
        try {
            const response = await this.axiosInstance.post(`/api/users/forgot-password`, { email });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }

    // reset password
    async resetPassword(email, password) {
        try {
            const response = await this.axiosInstance.post(`/api/users/reset-password`, { email, password });
            return response.data;
        } catch (error) {   
            throw error.response.data;
        }
    }
    
    async logout(refreshToken) {
        try {
            const response = await this.axiosInstance.post(`/api/users/logout`, {
                refreshToken: refreshToken
            });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    async deleteAccount () {
        try {
            const response = await this.axiosInstance.delete(`/api/users`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    // get user by id
    async getUserById() {
        try {
            const response = await this.axiosInstance.get(`/api/users`);
            return response.data;   
        } catch (error) {
            throw error.response.data;
        }
    }

   
    // update profile
    async updateProfile(userId, profileData) {
        try {
            const response = await this.axiosInstance.put(`/api/users/${userId}/profile`, profileData);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }

    // get groups
    async getGroups() {
        try {
            const response = await this.axiosInstance.get(`/api/groups`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    async getGroupById(groupId) {
        try {
            const response = await this.axiosInstance.get(`/api/groups/${groupId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }

    async joinGroupRequest(joinRes) {
        try {
            const response = await this.axiosInstance.post(`/api/users/joinGroupRequest`, joinRes);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }   
    }
    async leaveGroup(groupId) {
        try {
            const response = await this.axiosInstance.post(`/api/users/leave-group`, { groupId });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    // get lectures
    async getLectures(groupId) {
        try {
            const response = await this.axiosInstance.get(`/api/lectures/group/${groupId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    async getLectureById(lectureId) {
        try {
            const response = await this.axiosInstance.get(`/api/lectures/${lectureId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    async getUserAttendanceStatusInGroup(groupId) {
        try {
            const response = await this.axiosInstance.get(`/api/lectures/${groupId}/get-user-attendance-status-in-group`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    async attendLecture(lectureId, code) {
        try {
            const response = await this.axiosInstance.post(`/api/lectures/attend`, { lectureId, code });
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    async submitTask(lecCourse, taskId, taskData) {
        try {
            const response = await this.axiosInstance.post(`/api/lectures/${lecCourse}/submit-task/${taskId}`, taskData);
            return response.data;
        } catch (error) {
            throw error.response.data;  
        }
    }
  
    
    async getQuizzesByLectureId(lectureId) {
        try {
            const response = await this.axiosInstance.get(`/api/quizzes/lecture/${lectureId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    // get quiz by id

    async getQuizById(quizId) {
        try {
            const response = await this.axiosInstance.get(`/api/quizzes/${quizId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
 

    async solveQuiz(quizId, answers) {
        try {
            const response = await this.axiosInstance.post(`/api/quizzes/solve`, { quizId, answers });
            return response.data;
        } catch (error) {
            throw error.response.data;      
        }
    }
    async getScore (quizId) {
        try {
            const response = await this.axiosInstance.get(`/api/quizzes/score/${quizId}`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    // get notifications
    async getNotifications() {
        try {
            const response = await this.axiosInstance.get(`/api/notifications`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }


    // get chats
    async getChats() {
        try {
            const response = await this.axiosInstance.get(`/api/chats`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }

    // submit feedback
    async submitFeedback(feedbackData) {
        try {
            const response = await this.axiosInstance.post(`/api/users/submit-feedback`, feedbackData);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    async getFeedback() {
        try {
            const response = await this.axiosInstance.get(`/api/users/get-all-feedback`);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
    // contact us
    async contactUs(contactData) {
        try {
            const response = await this.axiosInstance.post(`/api/contact/contact-us`, contactData);
            return response.data;
        } catch (error) {
            throw error.response.data;
        }
    }
}

export default UserService;
    