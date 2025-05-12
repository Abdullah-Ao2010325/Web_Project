import { getTotalStudents } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function TotalStudents() {
  const result = await getTotalStudents();
  const students = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-users"></i> Total Students Report</h1>
        {students.length > 0 ? (
          <table className="stats-table" aria-label="Total Students">
            <thead>
              <tr>
                <th><i className="fas fa-id-card"></i> Student ID</th>
                <th><i className="fas fa-user"></i> Username</th>
                <th><i className="fas fa-user-graduate"></i> Full Name</th>
                <th><i className="fas fa-book"></i> Major</th>
                <th><i className="fas fa-chalkboard-teacher"></i> Advisor</th>
                <th><i className="fas fa-chart-line"></i> CGPA</th>
                <th><i className="fas fa-list"></i> Completed Courses</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.username}</td>
                  <td>{`${student.firstName} ${student.lastName}`}</td>
                  <td>{student.majorName}</td>
                  <td>{student.advisor}</td>
                  <td>{student.cgpa.toFixed(2)}</td>
                  <td>{student.completedCourses.split(',').filter(c => c).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No student data available.</p>
        )}
      </div>
    </>
  );
}