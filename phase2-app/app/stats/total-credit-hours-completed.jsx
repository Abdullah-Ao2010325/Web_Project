import { getTotalCreditHoursCompleted } from '../../serverActions/statistics-actions';

export default async function TotalCreditHoursCompleted() {
  const result = await getTotalCreditHoursCompleted();
  return (
    <div className="container">
      <h1 className="welcome-content">Total Credit Hours Completed</h1>
      <p className="course-section">{result.success ? result.data.toFixed(2) : 'Error loading data'}</p>
    </div>
  );
}