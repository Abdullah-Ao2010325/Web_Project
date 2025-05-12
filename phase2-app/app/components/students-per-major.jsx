import { getStudentsPerMajor } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function StudentsPerMajor() {
  const result = await getStudentsPerMajor();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-graduation-cap"></i> Students Per Major Report</h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Students Per Major">
            <thead>
              <tr>
                <th><i className="fas fa-book"></i> Major</th>
                <th><i className="fas fa-users"></i> Number of Students</th>
                <th><i className="fas fa-calculator"></i> Average CGPA</th>
                <th><i className="fas fa-arrow-up"></i> Highest CGPA</th>
                <th><i className="fas fa-arrow-down"></i> Lowest CGPA</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.majorName}</td>
                  <td>{item.count}</td>
                  <td>{item.averageCGPA.toFixed(2)}</td>
                  <td>{item.highestCGPA.toFixed(2)}</td>
                  <td>{item.lowestCGPA.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No major data available.</p>
        )}
      </div>
    </>
  );
}