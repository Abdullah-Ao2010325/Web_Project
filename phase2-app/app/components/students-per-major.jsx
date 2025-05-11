import { getStudentsPerMajor } from '@/app/server-actions/actions';

export default async function StudentsPerMajor() {
  const result = await getStudentsPerMajor();
  return (
    <div className="container">
      <h1 className="welcome-content">Students per Major</h1>
      <p className="course-section">
        {result.success ? result.data.map((item, index) => (
          <span key={index}>{item.majorName}: {item.count} {index < result.data.length - 1 ? ', ' : ''}</span>
        )) : 'Error loading data'}
      </p>
    </div>
  );
}