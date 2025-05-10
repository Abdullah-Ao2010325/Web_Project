import { getFailureRatePerCourse } from '../../serverActions/statistics-actions';

export default async function FailureRatePerCourse() {
  const result = await getFailureRatePerCourse();
  return (
    <div className="container">
      <h1 className="welcome-content">Failure Rate per Course</h1>
      <p className="course-section">
        {result.success ? result.data.map((item, index) => (
          <span key={index}>{item.courseName}: {item.failureRate.toFixed(2)}% {index < result.data.length - 1 ? ', ' : ''}</span>
        )) : 'Error loading data'}
      </p>
    </div>
  );
}