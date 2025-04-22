import axios from "axios";
import { toast } from "react-hot-toast";

class BaseService {
  constructor(URLAPI, token) {
    this.URLAPI = URLAPI;
    this.token = token;
  }

  // get Data
  async fetchData(endpoint) {
    try {
      const res = await axios.get(`${this.URLAPI}${endpoint}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }

  // add Data
  async addData(endpoint, data) {
 
    try {
      const res = await axios.post(`${this.URLAPI}${endpoint}`, data, {
        headers: { Authorization: `${this.token} `, "Content-Type": "application/json" }
      });
      toast.success(res.data.message);
     return res.data;
    } catch (error) {
      toast.error("Failed to add");
      throw error;
    }
  }

  // update Data
  async updateData(endpoint, data) {
    try {
      await axios.put(`${this.URLAPI}${endpoint}`, data, {
        headers: { Authorization: ` ${this.token}` }
      });
      toast.success("Successfully updated");
      return true;
    } catch (error) {
      toast.error("Failed to update");
      throw error;
    }
  }

  // delete Data
  async deleteData(endpoint) {
    try {
      await axios.delete(`${this.URLAPI}${endpoint}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      toast.success("Successfully deleted");
      return true;
    } catch (error) {
      toast.error("Failed to delete");
      throw error;
    }
  }

  // send Message
  async sendMessage(endpoint, messageData) {
    try {
      await axios.post(`${this.URLAPI}${endpoint}`, messageData, {
        headers: { Authorization: ` ${this.token}` }
      });
      toast.success("Successfully sent message");
      return true;
    } catch (error) {
      toast.error("Failed to send message");
      throw error;
    }
  }

  // get Details
  async getDetails(endpoint) {
    try {
      const res = await axios.get(`${this.URLAPI}${endpoint}`, {
        headers: { Authorization: ` ${this.token}` }
      });
      return res.data;
    } catch (error) {
      toast.error("Failed to get details");
      throw error;
    }
  }
}

export default BaseService; 