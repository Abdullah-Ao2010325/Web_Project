import { getStudentsPerAdvisor } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function StudentsPerAdvisor() {
  const result = await getStudentsPerAdvisor();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-chalkboard-teacher"></i> Students Per Advisor Report</h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Students Per Advisor">
            <thead>
              <tr>
                <th><i className="fas fa-user-tie"></i> Advisor</th>
                <th><i className="fas fa-users"></i> Number of Students</th>
                <th><i className="fas fa-calculator"></i> Average CGPA</th>
                <th><i className="fas fa-check-circle"></i> Students Above 3.0</th>
                <th><i className="fas fa-times-circle"></i> Students Below 2.0</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.advisor}</td>
                  <td>{item.count}</td>
                  <td>{item.averageCGPA.toFixed(2)}</td>
                  <td>{item.studentsAboveThree}</td>
                  <td>{item.studentsBelowTwo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No advisor data available.</p>
        )}
      </div>
    </>
  );
}