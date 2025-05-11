import { getDynamicAverageGPA } from '@/app/server-actions/actions';

export default async function AverageCGPA() {
  const result = await getDynamicAverageGPA();

  console.log('Dynamic GPA result:', result);

  const average =
    result.success && typeof result.data === 'number'
      ? result.data.toFixed(2)
      : 'Error loading data';

  return (
    <div className="container">
      <h1 className="welcome-content">Dynamic Average GPA</h1>
      <p className="course-section">{average}</p>
    </div>
  );
}
