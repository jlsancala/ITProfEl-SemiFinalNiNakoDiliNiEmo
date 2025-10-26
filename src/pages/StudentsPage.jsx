import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_number: "",
    first_name: "",
    last_name: "",
    course: "",
    year_level: ""
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("id", { ascending: true });
    
    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "year_level" || name === "student_number" ? parseInt(value) || "" : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingStudent) {
      const { error } = await supabase
        .from("students")
        .update(formData)
        .eq("id", editingStudent.id);
      
      if (error) {
        console.error("Error updating student:", error);
      } else {
        fetchStudents();
        closeModal();
      }
    } else {
      const { error } = await supabase
        .from("students")
        .insert([formData]);
      
      if (error) {
        console.error("Error adding student:", error);
      } else {
        fetchStudents();
        closeModal();
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_number: student.student_number,
      first_name: student.first_name,
      last_name: student.last_name,
      course: student.course,
      year_level: student.year_level
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting student:", error);
      } else {
        fetchStudents();
      }
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      student_number: "",
      first_name: "",
      last_name: "",
      course: "",
      year_level: ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      student_number: "",
      first_name: "",
      last_name: "",
      course: "",
      year_level: ""
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
            <h2 className="text-3xl font-bold">Students</h2>
            <button
              onClick={openAddModal}
              className="bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              Add Student
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="py-3 px-4 font-semibold">Student Number</th>
                  <th className="py-3 px-4 font-semibold">First Name</th>
                  <th className="py-3 px-4 font-semibold">Last Name</th>
                  <th className="py-3 px-4 font-semibold">Course</th>
                  <th className="py-3 px-4 font-semibold">Year Level</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">{student.student_number}</td>
                    <td className="py-3 px-4">{student.first_name}</td>
                    <td className="py-3 px-4">{student.last_name}</td>
                    <td className="py-3 px-4">{student.course}</td>
                    <td className="py-3 px-4">{student.year_level}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
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
              {editingStudent ? "Edit Student" : "Add New Student"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Student Number</label>
                <input
                  type="number"
                  name="student_number"
                  value={formData.student_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="BS IT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Year Level</label>
                <input
                  type="number"
                  name="year_level"
                  value={formData.year_level}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-white/50"
                  placeholder="1"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                {editingStudent ? "Update" : "Add"}
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