import { getStudentProgress } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function StudentProgress() {
  const result = await getStudentProgress();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title">
          <i className="fas fa-graduation-cap"></i> Student Progress
        </h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Student Progress">
            <thead>
              <tr>
                <th><i className="fas fa-id-card"></i> Student ID</th>
                <th><i className="fas fa-user"></i> Full Name</th>
                <th><i className="fas fa-graduation-cap"></i> Major</th>
                <th><i className="fas fa-clock"></i> Completed Credit Hours</th>
                <th><i className="fas fa-clock"></i> Total Credit Hours</th>
                <th><i className="fas fa-percentage"></i> Progress Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.studentId}</td>
                  <td>{item.fullName}</td>
                  <td>{item.major}</td>
                  <td>{item.completedCreditHours}</td>
                  <td>{item.totalCreditHours}</td>
                  <td>{item.progressPercentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg">
            <i className="fas fa-exclamation-circle"></i> No student progress data available.
          </p>
        )}
      </div>
    </>
  );
}