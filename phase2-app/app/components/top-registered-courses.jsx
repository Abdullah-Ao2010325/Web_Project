import { getTopRegisteredCourses } from '@/app/server-actions/actions';
export default async function TopRegisteredCourses() {
  const result = await getTopRegisteredCourses();
  return (
    <div className="container">
      <h1 className="welcome-content">Top 3 Registered Courses</h1>
      <p className="course-section">
        {result.success ? result.data.map((item, index) => (
          <span key={index}>{item.courseName}: {item.registrations} {index < result.data.length - 1 ? ', ' : ''}</span>
        )) : 'Error loading data'}
      </p>
    </div>
  );
}