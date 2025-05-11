import { getLowCGPARatePerCourse } from '@/app/server-actions/actions';
export default async function LowCGPARatePerCourse() {
  const result = await getLowCGPARatePerCourse();
  return (
    <div className="container">
      <h1 className="welcome-content">Low CGPA Rate per Course</h1>
      <p className="course-section">
        {result.success
          ? result.data.map((item, index) => (
              <span key={index}>
                {item.courseName}: {item.failureRate.toFixed(2)}%
                {index < result.data.length - 1 ? ', ' : ''}
              </span>
            ))
          : 'Error loading data'}
      </p>
    </div>
  );
}
