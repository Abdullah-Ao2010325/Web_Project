import { getAdvisorWorkload } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function AdvisorWorkload() {
  const result = await getAdvisorWorkload();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title">
          <i className="fas fa-user-tie"></i> Advisor Workload
        </h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Advisor Workload Report">
            <thead>
              <tr>
                <th><i className="fas fa-user"></i> Advisor</th>
                <th><i className="fas fa-users"></i> Student Count</th>
                <th><i className="fas fa-chart-line"></i> Average Student CGPA</th>
                <th><i className="fas fa-exclamation-circle"></i> Struggling Students</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.advisor}</td>
                  <td>{item.studentCount}</td>
                  <td>{item.averageStudentCGPA.toFixed(2)}</td>
                  <td>{item.strugglingStudents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg">
            <i className="fas fa-exclamation-circle"></i> No advisor workload data available.
          </p>
        )}
      </div>
    </>
  );
}