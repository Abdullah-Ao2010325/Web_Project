import { getPercentageCGPAAboveThree } from '@/app/server-actions/actions';
import '@/app/styles/stats-table.css';
import '@/app/styles/percentage-cgpa-above-three.css';

export default async function PercentageCGPAAboveThree() {
  const result = await getPercentageCGPAAboveThree();
  const percentage = result.success ? result.data : 0;

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="container">
        <h1 className="page-title"><i className="fas fa-check-circle"></i> Percentage CGPA Above 3.0</h1>
        <div className="percentage-display">
          <i className="fas fa-percentage"></i> {percentage.toFixed(2)}%
        </div>
      </div>
    </>
  );
}