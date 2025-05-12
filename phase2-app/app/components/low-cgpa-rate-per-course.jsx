import { getLowCGPARatePerCourse } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function LowCGPARatePerCourse() {
  const result = await getLowCGPARatePerCourse();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-exclamation-circle"></i> Low CGPA Rate Per Course</h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Low CGPA Rate Per Course Report">
            <thead>
              <tr>
                <th><i className="fas fa-book"></i> Course Name</th>
                <th><i className="fas fa-users"></i> Total Registrations</th>
                <th><i className="fas fa-calculator"></i> Average CGPA</th>
                <th><i className="fas fa-times-circle"></i> Failure Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
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
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No course performance data available.</p>
        )}
      </div>
    </>
  );
}