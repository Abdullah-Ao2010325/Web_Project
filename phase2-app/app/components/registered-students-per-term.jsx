import { getRegisteredStudentsPerTerm } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function RegisteredStudentsPerTerm() {
  const result = await getRegisteredStudentsPerTerm();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-calendar"></i> Registered Students Per Term Report</h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Registered Students Per Term">
            <thead>
              <tr>
                <th><i className="fas fa-calendar-alt"></i> Term</th>
                <th><i className="fas fa-users"></i> Total Registered Students</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.term}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg"><i className="fas fa-exclamation-circle"></i> No registration data available.</p>
        )}
      </div>
    </>
  );
}