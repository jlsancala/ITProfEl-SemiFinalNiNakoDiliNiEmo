import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subject_code: "",
    subject_name: "",
    instructor: ""
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) {
      console.error("Error fetching subjects:", error);
    } else {
      setSubjects(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingSubject) {
      const { error } = await supabase
        .from("subjects")
        .update(formData)
        .eq("id", editingSubject.id);
      
      if (error) {
        console.error("Error updating subject:", error);
      } else {
        fetchSubjects();
        closeModal();
      }
    } else {
      const { error } = await supabase
        .from("subjects")
        .insert([formData]);
      
      if (error) {
        console.error("Error adding subject:", error);
      } else {
        fetchSubjects();
        closeModal();
      }
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      instructor: subject.instructor
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting subject:", error);
      } else {
        fetchSubjects();
      }
    }
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      subject_code: "",
      subject_name: "",
      instructor: ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData({
      subject_code: "",
      subject_name: "",
      instructor: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-8">
      {/* Navigation Bar */}
      <nav className="w-full max-w-6xl mx-auto flex justify-between items-center mb-10 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 shadow-lg">
        <h1 className="text-2xl font-bold tracking-wide">Student Portal</h1>
        <div className="flex gap-6 text-lg font-medium">
          <a href="/" className="hover:text-yellow-300 transition-colors">
            Home
          </a>
          <a href="/students" className="hover:text-yellow-300 transition-colors">
            Students
          </a>
          <a href="/subjects" className="hover:text-yellow-300 transition-colors">
            Subjects
          </a>
          <a href="/grades" className="hover:text-yellow-300 transition-colors">
            Grades
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Subjects</h2>
            <button
              onClick={openAddModal}
              className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Add Subject
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-3 px-4 font-semibold">Subject Code</th>
                  <th className="py-3 px-4 font-semibold">Subject Name</th>
                  <th className="py-3 px-4 font-semibold">Instructor</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">{subject.subject_code}</td>
                    <td className="py-3 px-4">{subject.subject_name}</td>
                    <td className="py-3 px-4">{subject.instructor}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject Code</label>
                <input
                  type="text"
                  name="subject_code"
                  value={formData.subject_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject Name</label>
                <input
                  type="text"
                  name="subject_name"
                  value={formData.subject_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instructor</label>
                <input
                  type="text"
                  name="instructor"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                {editingSubject ? "Update" : "Add"}
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}