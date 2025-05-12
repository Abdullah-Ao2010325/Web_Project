import { getPrerequisiteEffectiveness } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function PrerequisiteEffectiveness() {
  const result = await getPrerequisiteEffectiveness();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title">
          <i className="fas fa-bookmark"></i> Prerequisite Effectiveness
        </h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Prerequisite Effectiveness">
            <thead>
              <tr>
                <th><i className="fas fa-book"></i> Course Name</th>
                <th><i className="fas fa-users"></i> Total Students</th>
                <th><i className="fas fa-user-check"></i> Students with Prerequisite</th>
                <th><i className="fas fa-chart-line"></i> Average CGPA with Prerequisite</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.courseName}</td>
                  <td>{item.totalStudents}</td>
                  <td>{item.studentsWithPrereq}</td>
                  <td>{item.avgCGPAWithPrereq.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg">
            <i className="fas fa-exclamation-circle"></i> No prerequisite effectiveness data available.
          </p>
        )}
      </div>
    </>
  );
}