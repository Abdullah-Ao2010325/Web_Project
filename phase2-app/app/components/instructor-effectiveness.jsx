import { getInstructorEffectiveness } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function InstructorEffectiveness() {
  const result = await getInstructorEffectiveness();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title">
          <i className="fas fa-chalkboard-teacher"></i> Instructor Effectiveness
        </h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Instructor Effectiveness Report">
            <thead>
              <tr>
                <th><i className="fas fa-user"></i> Instructor Name</th>
                <th><i className="fas fa-users"></i> Student Count</th>
                <th><i className="fas fa-chart-line"></i> Average Student CGPA</th>
                <th><i className="fas fa-percentage"></i> High CGPA Rate</th>
                <th><i className="fas fa-book"></i> Total Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.instructorName}</td>
                  <td>{item.studentCount}</td>
                  <td>{item.averageStudentCGPA.toFixed(2)}</td>
                  <td>{item.highCGPARate.toFixed(2)}%</td>
                  <td>{item.totalEnrollments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg">
            <i className="fas fa-exclamation-circle"></i> No instructor effectiveness data available.
          </p>
        )}
      </div>
    </>
  );
}