import { getStudentsPerAdvisor } from '@/app/server-actions/actions';
export default async function StudentsPerAdvisor() {
  const result = await getStudentsPerAdvisor();
  
  return (
    <div className="container">
      <h1 className="welcome-content">Students per Advisor</h1>
      <p className="course-section">
        {result.success
          ? result.data.map((item, index) => (
              <span key={index}>
                {item.advisor}: {item.count}
                {index < result.data.length - 1 ? ', ' : ''}
              </span>
            ))
          : 'Error loading data'}
      </p>
    </div>
  );
}
