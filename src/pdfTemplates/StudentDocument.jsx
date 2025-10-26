import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #4F46E5',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  subjectInfo: {
    backgroundColor: '#EEF2FF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 10,
    marginTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    color: '#6B7280',
    width: 100,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  analysisSection: {
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  analysisText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#374151',
    textAlign: 'justify',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
  },
  passedBox: {
    backgroundColor: '#ECFDF5',
    borderLeft: '4 solid #10B981',
  },
  failedBox: {
    backgroundColor: '#FEF2F2',
    borderLeft: '4 solid #EF4444',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  passedTitle: {
    color: '#047857',
  },
  failedTitle: {
    color: '#DC2626',
  },
  studentList: {
    marginTop: 5,
  },
  studentItem: {
    fontSize: 9,
    marginBottom: 4,
    paddingLeft: 10,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    padding: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
  },
  tableCell: {
    fontSize: 8,
    textAlign: 'center',
    color: '#374151',
  },
  tableCellLeft: {
    textAlign: 'left',
  },
  statusPassed: {
    color: '#059669',
    fontWeight: 'bold',
  },
  statusFailed: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 8,
    borderTop: '1 solid #E5E7EB',
    paddingTop: 10,
  },
  col1: { width: '12%' },
  col2: { width: '20%' },
  col3: { width: '10%' },
  col4: { width: '10%' },
  col5: { width: '10%' },
  col6: { width: '10%' },
  col7: { width: '10%' },
  col8: { width: '18%' },
});

const StudentDocument = ({ subjectInfo, aiReport, studentsGrades }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Grade Analysis Report</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Subject Information */}
        <View style={styles.subjectInfo}>
          <Text style={styles.sectionTitle}>Subject Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subject Code:</Text>
            <Text style={styles.infoValue}>{subjectInfo.subject_code}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subject Name:</Text>
            <Text style={styles.infoValue}>{subjectInfo.subject_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Instructor:</Text>
            <Text style={styles.infoValue}>{subjectInfo.instructor}</Text>
          </View>
        </View>

        {/* AI Analysis */}
        <Text style={styles.sectionTitle}>AI Analysis</Text>
        <View style={styles.analysisSection}>
          <Text style={styles.analysisText}>{aiReport.analysis}</Text>
        </View>

        {/* Passed/Failed Summary */}
        <Text style={styles.sectionTitle}>Performance Summary</Text>
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryBox, styles.passedBox]}>
            <Text style={[styles.summaryTitle, styles.passedTitle]}>
              ✓ Passed Students ({aiReport.passedStudents?.length || 0})
            </Text>
            <View style={styles.studentList}>
              {aiReport.passedStudents && aiReport.passedStudents.length > 0 ? (
                aiReport.passedStudents.map((name, idx) => (
                  <Text key={idx} style={styles.studentItem}>• {name}</Text>
                ))
              ) : (
                <Text style={styles.studentItem}>No students passed</Text>
              )}
            </View>
          </View>

          <View style={[styles.summaryBox, styles.failedBox]}>
            <Text style={[styles.summaryTitle, styles.failedTitle]}>
              ✗ Failed Students ({aiReport.failedStudents?.length || 0})
            </Text>
            <View style={styles.studentList}>
              {aiReport.failedStudents && aiReport.failedStudents.length > 0 ? (
                aiReport.failedStudents.map((name, idx) => (
                  <Text key={idx} style={styles.studentItem}>• {name}</Text>
                ))
              ) : (
                <Text style={styles.studentItem}>No students failed</Text>
              )}
            </View>
          </View>
        </View>

        {/* Student Grades Table */}
        <Text style={styles.sectionTitle}>Detailed Student Grades</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>Student #</Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>Name</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Prelim</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>Midterm</Text>
            <Text style={[styles.tableHeaderCell, styles.col5]}>Semifinal</Text>
            <Text style={[styles.tableHeaderCell, styles.col6]}>Final</Text>
            <Text style={[styles.tableHeaderCell, styles.col7]}>Average</Text>
            <Text style={[styles.tableHeaderCell, styles.col8]}>Status</Text>
          </View>

          {studentsGrades.map((student, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col1]}>{student.studentNumber}</Text>
              <Text style={[styles.tableCell, styles.tableCellLeft, styles.col2]}>{student.name}</Text>
              <Text style={[styles.tableCell, styles.col3]}>{student.prelim || '-'}</Text>
              <Text style={[styles.tableCell, styles.col4]}>{student.midterm || '-'}</Text>
              <Text style={[styles.tableCell, styles.col5]}>{student.semifinal || '-'}</Text>
              <Text style={[styles.tableCell, styles.col6]}>{student.final || '-'}</Text>
              <Text style={[styles.tableCell, styles.col7]}>{student.average}</Text>
              <Text style={[
                styles.tableCell, 
                styles.col8,
                student.status === 'PASSED' ? styles.statusPassed : styles.statusFailed
              ]}>
                {student.status}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was generated automatically using AI analysis.</Text>
          <Text>© {new Date().getFullYear()} Student Portal - All Rights Reserved</Text>
        </View>
      </Page>
    </Document>
  );
};

export default StudentDocument;