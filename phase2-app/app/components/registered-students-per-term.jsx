import { getRegisteredStudentsPerTerm } from '@/app/server-actions/actions';

export default async function RegisteredStudentsPerTerm() {
  const result = await getRegisteredStudentsPerTerm();
  return (
    <div className="container">
      <h1 className="welcome-content">Registered Students per Term</h1>
      <p className="course-section">
        {result.success ? result.data.map((item, index) => (
          <span key={index}>{item.term}: {item.count} {index < result.data.length - 1 ? ', ' : ''}</span>
        )) : 'Error loading data'}
      </p>
    </div>
  );
}