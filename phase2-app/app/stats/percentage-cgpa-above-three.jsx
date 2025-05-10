import { getPercentageCGPAAboveThree } from '../../serverActions/statistics-actions';

export default async function PercentageCGPAAboveThree() {
  const result = await getPercentageCGPAAboveThree();
  return (
    <div className="container">
      <h1 className="welcome-content">Percentage CGPA {'>'} 3.0</h1>
      <p className="course-section">{result.success ? result.data.toFixed(2) : 'Error loading data'}%</p>
    </div>
  );
}