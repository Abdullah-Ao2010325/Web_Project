import { getAverageCGPA } from '../../serverActions/statistics-actions';

export default async function AverageCGPA() {
  const result = await getAverageCGPA();
  return (
    <div className="container">
      <h1 className="welcome-content">Average CGPA</h1>
      <p className="course-section">{result.success ? result.data.toFixed(2) : 'Error loading data'}</p>
    </div>
  );
}