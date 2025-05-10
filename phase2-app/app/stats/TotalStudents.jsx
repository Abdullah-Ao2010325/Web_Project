import { getTotalStudents } from '../../serverActions/statistics-actions';

export default async function TotalStudents() {
  const result = await getTotalStudents();
  return (
    <div className="container">
      <h1 className="welcome-content">Total Students</h1>
      <p className="course-section">{result.success ? result.data : 'Error loading data'}</p>
    </div>
  );
}