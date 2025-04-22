import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { DataContext } from "../../Users/Context/Context";
import AdminService from "../../classes/AdminService";

function Groups() {
  const { URLAPI, getTokenAdmin } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adminService] = useState(new AdminService(URLAPI, getTokenAdmin));
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    max_students: "",
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllGroups();
      setGroups(response.groups);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error(error.message || "Failed to fetch groups");
      setLoading(false);
    }
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await adminService.createGroup(formData);
      toast.success("Group created successfully!");
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        max_students: "",
      });
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.message || "Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) {
      return;
    }
    try {
      await adminService.deleteGroup(groupId);
      toast.success("Group deleted successfully");
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error(error.message || "Failed to delete group");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Groups Management</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add New Group
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {groups.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info text-center">
              No groups available. Create a new group to get started.
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group._id} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{group.title}</h5>
                  <p className="card-text">{group.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      Start Date: {new Date(group.start_date).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">
                      End Date: {new Date(group.end_date).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">
                      Max Students: {group.max_students}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Link
                      to={`/admin/${group._id}/students`}
                      className="btn btn-primary btn-sm"
                    >
                      Students
                    </Link>
                    <Link
                      to={`/admin/${group._id}/lectures`}
                      className="btn btn-info btn-sm"
                    >
                      Lectures
                    </Link>
                    <Link
                      to={`/admin/${group._id}/tasks`}
                      className="btn btn-success btn-sm"
                    >
                      Tasks
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteGroup(group._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Group Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Group</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddGroup}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Maximum Students</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.max_students}
                      onChange={(e) =>
                        setFormData({ ...formData, max_students: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Add Group
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups; 