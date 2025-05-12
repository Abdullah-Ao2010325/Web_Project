import { getTopRegisteredCourses } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function TopRegisteredCourses() {
  const result = await getTopRegisteredCourses();
  const courses = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-star"></i> Top 3 Registered Courses Report</h1>
        {courses.length > 0 ? (
          <table className="stats-table" aria-label="Top 3 Registered Courses">
            <thead>
              <tr>
                <th><i className="fas fa-book"></i> Course Name</th>
                <th><i className="fas fa-users"></i> Total Registrations</th>
                <th><i className="fas fa-calculator"></i> Average CGPA</th>
                <th><i className="fas fa-exclamation-circle"></i> Failure Rate</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((item, index) => (
                <tr key={index}>
                  <td>{item.courseName}</td>
                  <td>{item.registrations}</td>
                  <td>{item.averageCGPA?.toFixed(2) || 'N/A'}</td>
                  <td>{item.failureRate?.toFixed(2) || '0.00'}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No course registration data available.</p>
        )}
      </div>
    </>
  );
}