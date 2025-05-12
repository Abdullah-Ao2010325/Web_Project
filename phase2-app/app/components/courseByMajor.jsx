import { getCoursesByMajor } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';

export default async function CoursesByMajor() {
  const result = await getCoursesByMajor();
  const data = result.success ? result.data : [];

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title">
          <i className="fas fa-table"></i> Courses by Major
        </h1>
        {data.length > 0 ? (
          <table className="stats-table" aria-label="Courses by Major Report">
            <thead>
              <tr>
                <th><i className="fas fa-graduation-cap"></i> Major</th>
                <th><i className="fas fa-book"></i> Courses</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.major}</td>
                  <td>{item.courses.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="error-msg">
            <i className="fas fa-exclamation-circle"></i> No courses by major data available.
          </p>
        )}
      </div>
    </>
  );
}