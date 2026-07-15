import { Link, useParams } from 'react-router-dom'
import { workers } from '../../data/ffbReception.js'
import { IconChevron } from '../../components/icons.jsx'

export default function FfbWorkerDetail() {
  const { workerId } = useParams()
  const worker = workers.find((w) => w.id === workerId)

  return (
    <div className="content">
      <Link className="station-back" to="/report/ffb-reception">
        <IconChevron size={14} />
        Back to FFB Reception
      </Link>

      {worker ? (
        <>
          <div className="page-head">
            <div>
              <h1>{worker.name}</h1>
              <p>
                {worker.role} · {worker.team ? `Shift ${worker.team}` : 'Both shifts'}
              </p>
            </div>
          </div>

          <div className="placeholder-card">
            <h2>Salary details coming soon</h2>
            <p>Tell me what details to show for {worker.name}'s salary and I'll build this page.</p>
          </div>
        </>
      ) : (
        <div className="page-head">
          <div>
            <h1>Worker not found</h1>
          </div>
        </div>
      )}
    </div>
  )
}
