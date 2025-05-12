import { getCourseCompletionRate } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function CourseCompletionRate() {
  const result = await getCourseCompletionRate();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title">
          <i className="fas fa-book-open"></i> Course Completion
        </h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Course Completion Rate Report">
            <thead>
              <tr>
                <th><i className="fas fa-book"></i> Course Name</th>
                <th><i className="fas fa-users"></i> Enrolled Students</th>
                <th><i className="fas fa-user-check"></i> Completed Students</th>
                <th><i className="fas fa-percentage"></i> Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.courseName}</td>
                  <td>{item.enrolled}</td>
                  <td>{item.completed}</td>
                  <td>{item.completionRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg">
            <i className="fas fa-exclamation-circle"></i> No course completion data available.
          </p>
        )}
      </div>
    </>
  );
}