import { getAverageCoursesPerStudent } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function AverageCoursesPerStudent() {
  const result = await getAverageCoursesPerStudent();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-list"></i> Average Courses Per Student</h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Average Courses Per Student Report">
            <thead>
              <tr>
                <th><i className="fas fa-id-card"></i> Student ID</th>
                <th><i className="fas fa-user-graduate"></i> Full Name</th>
                <th><i className="fas fa-book"></i> Major</th>
                <th><i className="fas fa-list"></i> Completed Courses</th>
              </tr>
            </thead>
            <tbody>
              {data.map((student, index) => (
                <tr key={index}>
                  <td>{student.student_id}</td>
                  <td>{`${student.firstName} ${student.lastName}`}</td>
                  <td>{student.major}</td>
                  <td>{student.completedCoursesCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No course completion data available.</p>
        )}
      </div>
    </>
  );
}