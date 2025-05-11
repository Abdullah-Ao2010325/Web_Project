import { getAverageCoursesPerStudent } from '@/app/server-actions/actions';
export default async function AverageCoursesPerStudent() {
  const result = await getAverageCoursesPerStudent();
  return (
    <div className="container">
      <h1 className="welcome-content">Average Courses per Student</h1>
      <p className="course-section">{result.success ? result.data.toFixed(2) : 'Error loading data'}</p>
    </div>
  );
}