import supabase from "./supabase";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function studentsAnalyzer(subjectId) {
  try {
    // Fetch subject information
    const { data: subject, error: subjectError } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .single();

    if (subjectError) throw subjectError;

    // Fetch all grades for this subject with student information
    const { data: gradesData, error: gradesError } = await supabase
      .from("grades")
      .select(`
        *,
        students (
          student_number,
          first_name,
          last_name,
          course,
          year_level
        )
      `)
      .eq("subject_id", subjectId);

    if (gradesError) throw gradesError;

    // Format data for AI analysis
    const studentsData = gradesData.map(grade => {
      const average = calculateAverage(grade.prelim, grade.midterm, grade.semifinal, grade.final);
      return {
        studentNumber: grade.students.student_number,
        name: `${grade.students.first_name} ${grade.students.last_name}`,
        course: grade.students.course,
        yearLevel: grade.students.year_level,
        prelim: grade.prelim || 0,
        midterm: grade.midterm || 0,
        semifinal: grade.semifinal || 0,
        final: grade.final || 0,
        average: average,
        status: average <= 3.0 ? "PASSED" : "FAILED"
      };
    });

    // Create prompt for Gemini
    const prompt = `
You are an educational data analyst. Analyze the following student grades for the subject "${subject.subject_code} - ${subject.subject_name}" taught by ${subject.instructor}.

Student Data:
${JSON.stringify(studentsData, null, 2)}

Grading System: 1.0 (Highest) to 5.0 (Lowest), passing grade is 3.0 or below.

Please provide a comprehensive analysis in the following JSON format:
{
  "analysis": "A detailed narrative analysis of the class performance, trends, strengths, weaknesses, and recommendations (3-5 paragraphs)",
  "passedStudents": ["List of student names who passed"],
  "failedStudents": ["List of student names who failed"]
}

Your analysis should include:
1. Overall class performance and trends across terms
2. Identification of improvement or decline patterns
3. Comparison between different grading periods
4. Specific recommendations for improvement
5. Recognition of outstanding performers
6. Suggestions for students who need support

Respond ONLY with valid JSON, no additional text.
`;

    // Call Gemini API using fetch
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const text = data.candidates[0].content.parts[0].text;

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const aiAnalysis = JSON.parse(jsonMatch[0]);
    return aiAnalysis;

  } catch (error) {
    console.error("Error in studentsAnalyzer:", error);
    throw error;
  }
}

function calculateAverage(prelim, midterm, semifinal, final) {
  const scores = [prelim, midterm, semifinal, final].filter(s => s && s > 0);
  if (scores.length === 0) return 0;
  return (scores.reduce((a, b) => a + b, 0) / scores.length);
}