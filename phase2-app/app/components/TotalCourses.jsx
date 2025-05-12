import { getTotalCourses } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function TotalCourses() {
  const result = await getTotalCourses();
  const courses = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-book"></i> Total Courses Report</h1>
        {courses.length > 0 ? (
          <table className="stats-table" aria-label="Total Courses">
            <thead>
              <tr>
                <th><i className="fas fa-id-card"></i> Course ID</th>
                <th><i className="fas fa-book-open"></i> Course Name</th>
                <th><i className="fas fa-hashtag"></i> Course Number</th>
                <th><i className="fas fa-graduation-cap"></i> Major</th>
                <th><i className="fas fa-list"></i> Prerequisites</th>
                <th><i className="fas fa-info-circle"></i> Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.courseName}</td>
                  <td>{course.courseNumber}</td>
                  <td>{course.major}</td>
                  <td>{course.prerequisites || 'None'}</td>
                  <td>{course.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No course data available.</p>
        )}
      </div>
    </>
  );
}