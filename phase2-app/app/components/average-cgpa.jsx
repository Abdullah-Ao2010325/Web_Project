import { getStudentsPerMajor } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';


export default async function AverageCGPA() {
  const result = await getStudentsPerMajor();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-chart-line"></i> Average CGPA</h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Average CGPA Report">
            <thead>
              <tr>
                <th><i className="fas fa-book"></i> Major</th>
                <th><i className="fas fa-calculator"></i> Average CGPA</th>
                <th><i className="fas fa-arrow-up"></i> Highest CGPA</th>
                <th><i className="fas fa-arrow-down"></i> Lowest CGPA</th>
                <th><i className="fas fa-check-circle"></i> Students Above 3.0</th>
                <th><i className="fas fa-times-circle"></i> Students Below 2.0</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.majorName}</td>
                  <td>{item.averageCGPA.toFixed(2)}</td>
                  <td>{item.highestCGPA.toFixed(2)}</td>
                  <td>{item.lowestCGPA.toFixed(2)}</td>
                  <td>{item.studentsAboveThree}</td>
                  <td>{item.studentsBelowTwo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No CGPA data available.</p>
        )}
      </div>
    </>
  );
}