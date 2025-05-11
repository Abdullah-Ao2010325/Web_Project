import { getTotalCourses } from '@/app/server-actions/actions';

export default async function TotalCourses() {
  const result = await getTotalCourses();
  return (
    <div className="container">
      <h1 className="welcome-content">Total Courses</h1>
      <p className="course-section">
        {result.success ? result.data : 'Error loading data'}
      </p>
    </div>
  );
}
