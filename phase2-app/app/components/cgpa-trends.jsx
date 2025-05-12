import { getCGPATrendsByTerm } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function CGPATrendsByTerm() {
  const result = await getCGPATrendsByTerm();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title">
          <i className="fas fa-chart-line"></i> CGPA Trends by Term
        </h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="CGPA Trends by Term Report">
            <thead>
              <tr>
                <th><i className="fas fa-calendar"></i> Term</th>
                <th><i className="fas fa-chart-line"></i> Average CGPA</th>
                <th><i className="fas fa-users"></i> Student Count</th>
                <th><i className="fas fa-arrow-down"></i> Minimum CGPA</th>
                <th><i className="fas fa-arrow-up"></i> Maximum CGPA</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.term}</td>
                  <td>{item.averageCGPA.toFixed(2)}</td>
                  <td>{item.studentCount}</td>
                  <td>{item.minCGPA.toFixed(2)}</td>
                  <td>{item.maxCGPA.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg">
            <i className="fas fa-exclamation-circle"></i> No CGPA trend data available.
          </p>
        )}
      </div>
    </>
  );
}