import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { studentsAnalyzer } from "../lib/ai";

export default function GradesPage() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchGrades();
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("subject_code", { ascending: true });
    
    if (error) {
      console.error("Error fetching subjects:", error);
    } else {
      setSubjects(data);
    }
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("student_number", { ascending: true });
    
    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data);
    }
  };

  const fetchGrades = async () => {
    const { data, error } = await supabase
      .from("grades")
      .select("*")
      .eq("subject_id", selectedSubject);
    
    if (error) {
      console.error("Error fetching grades:", error);
    } else {
      setGrades(data);
    }
  };

  const getStudentGrade = (studentId) => {
    return grades.find(g => g.student_id === studentId) || {
      prelim: "",
      midterm: "",
      semifinal: "",
      final: ""
    };
  };

  const handleGradeChange = (studentId, field, value) => {
    const numValue = value === "" ? "" : parseFloat(value);
    
    setGrades(prevGrades => {
      const existingGrade = prevGrades.find(g => g.student_id === studentId);
      
      if (existingGrade) {
        return prevGrades.map(g => 
          g.student_id === studentId 
            ? { ...g, [field]: numValue }
            : g
        );
      } else {
        return [...prevGrades, {
          student_id: studentId,
          subject_id: parseInt(selectedSubject),
          prelim: field === "prelim" ? numValue : "",
          midterm: field === "midterm" ? numValue : "",
          semifinal: field === "semifinal" ? numValue : "",
          final: field === "final" ? numValue : ""
        }];
      }
    });
  };

  const calculateAverage = (grade) => {
    const scores = [grade.prelim, grade.midterm, grade.semifinal, grade.final];
    const validScores = scores.filter(s => s !== "" && s !== null && !isNaN(s));
    if (validScores.length === 0) return "-";
    const sum = validScores.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
    return (sum / validScores.length).toFixed(2);
  };

  const handleSaveGrades = async () => {
    for (const grade of grades) {
      const { data: existing } = await supabase
        .from("grades")
        .select("id")
        .eq("student_id", grade.student_id)
        .eq("subject_id", grade.subject_id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from("grades")
          .update({
            prelim: grade.prelim || null,
            midterm: grade.midterm || null,
            semifinal: grade.semifinal || null,
            final: grade.final || null
          })
          .eq("id", existing.id);
        
        if (error) console.error("Error updating grade:", error);
      } else {
        const { error } = await supabase
          .from("grades")
          .insert([{
            student_id: grade.student_id,
            subject_id: grade.subject_id,
            prelim: grade.prelim || null,
            midterm: grade.midterm || null,
            semifinal: grade.semifinal || null,
            final: grade.final || null
          }]);
        
        if (error) console.error("Error inserting grade:", error);
      }
    }
    
    alert("Grades saved successfully!");
    fetchGrades();
  };

  const generateAIReport = async () => {
    if (!selectedSubject) {
      alert("Please select a subject first.");
      return;
    }

    setIsAnalyzing(true);
    setShowPDF(false);

    try {
      const report = await studentsAnalyzer(selectedSubject);
      setAiReport(report);
      setShowPDF(true);
    } catch (error) {
      console.error("Error generating AI report:", error);
      alert("Failed to generate AI report. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSubjectInfo = () => {
    return subjects.find(s => s.id === parseInt(selectedSubject));
  };

  const getStudentInfo = (studentId) => {
    return students.find(s => s.id === studentId);
  };

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-8">
      {/* Navigation Bar */}
      <nav className="w-full max-w-6xl mx-auto flex justify-between items-center mb-10 bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 shadow-lg print:hidden">
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
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl p-8 print:hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Grades Management</h2>
            <div className="flex gap-3">
              <button
                onClick={handleSaveGrades}
                disabled={!selectedSubject}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                Save Grades
              </button>
              <button
                onClick={generateAIReport}
                disabled={!selectedSubject || isAnalyzing}
                className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-purple-900 font-semibold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
              >
                {isAnalyzing ? "Analyzing..." : "Generate AI Report"}
              </button>
            </div>
          </div>

          {/* Subject Selection */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-3">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setShowPDF(false);
                setAiReport(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
            >
              <option value="" className="bg-purple-900">-- Select a Subject --</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id} className="bg-purple-900">
                  {subject.subject_code} - {subject.subject_name}
                </option>
              ))}
            </select>
          </div>

          {/* Grades Table */}
          {selectedSubject && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-3 px-4 font-semibold">Student Number</th>
                    <th className="py-3 px-4 font-semibold">Name</th>
                    <th className="py-3 px-4 font-semibold">Prelim</th>
                    <th className="py-3 px-4 font-semibold">Midterm</th>
                    <th className="py-3 px-4 font-semibold">Semifinal</th>
                    <th className="py-3 px-4 font-semibold">Final</th>
                    <th className="py-3 px-4 font-semibold">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const grade = getStudentGrade(student.id);
                    return (
                      <tr key={student.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">{student.student_number}</td>
                        <td className="py-3 px-4">{student.first_name} {student.last_name}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={grade.prelim}
                            onChange={(e) => handleGradeChange(student.id, "prelim", e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={grade.midterm}
                            onChange={(e) => handleGradeChange(student.id, "midterm", e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={grade.semifinal}
                            onChange={(e) => handleGradeChange(student.id, "semifinal", e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={grade.final}
                            onChange={(e) => handleGradeChange(student.id, "final", e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                          />
                        </td>
                        <td className="py-3 px-4 font-semibold">{calculateAverage(grade)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PDF Report */}
        {showPDF && aiReport && (
          <div className="mt-8 bg-white text-gray-900 rounded-3xl shadow-xl p-12 print:shadow-none print:rounded-none">
            <style>{`
              @media print {
                body { background: white; }
                @page { margin: 2cm; }
              }
            `}</style>
            
            <div className="flex justify-between items-start mb-8 print:mb-12">
              <div>
                <h1 className="text-4xl font-bold text-indigo-900 mb-2">Grade Analysis Report</h1>
                <p className="text-gray-600">Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button 
                onClick={printPDF}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold print:hidden transition-colors"
              >
                Print / Save PDF
              </button>
            </div>

            {/* Subject Info */}
            <div className="bg-indigo-50 p-6 rounded-xl mb-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-4">Subject Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Subject Code</p>
                  <p className="text-lg font-semibold text-gray-900">{getSubjectInfo()?.subject_code}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Subject Name</p>
                  <p className="text-lg font-semibold text-gray-900">{getSubjectInfo()?.subject_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600 text-sm">Instructor</p>
                  <p className="text-lg font-semibold text-gray-900">{getSubjectInfo()?.instructor}</p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-indigo-900 mb-4">AI Analysis</h2>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{aiReport.analysis}</p>
              </div>
            </div>

            {/* Student Performance Summary */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-green-900 mb-4">Passed Students</h3>
                {aiReport.passedStudents && aiReport.passedStudents.length > 0 ? (
                  <ul className="space-y-2">
                    {aiReport.passedStudents.map((name, idx) => (
                      <li key={idx} className="flex items-center text-gray-800">
                        <span className="text-green-600 mr-2">✓</span>
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No students passed</p>
                )}
              </div>

              <div className="bg-red-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-red-900 mb-4">Failed Students</h3>
                {aiReport.failedStudents && aiReport.failedStudents.length > 0 ? (
                  <ul className="space-y-2">
                    {aiReport.failedStudents.map((name, idx) => (
                      <li key={idx} className="flex items-center text-gray-800">
                        <span className="text-red-600 mr-2">✗</span>
                        {name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 italic">No students failed</p>
                )}
              </div>
            </div>

            {/* Detailed Grades Table */}
            <div>
              <h2 className="text-2xl font-bold text-indigo-900 mb-4">Student Grades</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-900 text-white">
                      <th className="py-3 px-4 text-left border">Student Number</th>
                      <th className="py-3 px-4 text-left border">Name</th>
                      <th className="py-3 px-4 text-center border">Prelim</th>
                      <th className="py-3 px-4 text-center border">Midterm</th>
                      <th className="py-3 px-4 text-center border">Semifinal</th>
                      <th className="py-3 px-4 text-center border">Final</th>
                      <th className="py-3 px-4 text-center border">Average</th>
                      <th className="py-3 px-4 text-center border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const grade = getStudentGrade(student.id);
                      const average = calculateAverage(grade);
                      const passed = average !== "-" && parseFloat(average) <= 3.0;
                      
                      return (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 border">{student.student_number}</td>
                          <td className="py-3 px-4 border">{student.first_name} {student.last_name}</td>
                          <td className="py-3 px-4 text-center border">{grade.prelim || "-"}</td>
                          <td className="py-3 px-4 text-center border">{grade.midterm || "-"}</td>
                          <td className="py-3 px-4 text-center border">{grade.semifinal || "-"}</td>
                          <td className="py-3 px-4 text-center border">{grade.final || "-"}</td>
                          <td className="py-3 px-4 text-center font-semibold border">{average}</td>
                          <td className={`py-3 px-4 text-center font-semibold border ${passed ? 'text-green-600' : 'text-red-600'}`}>
                            {average !== "-" ? (passed ? "PASSED" : "FAILED") : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-600 text-sm">
              <p>This report was generated automatically using AI analysis.</p>
              <p className="mt-1">© {new Date().getFullYear()} Student Portal - All Rights Reserved</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}