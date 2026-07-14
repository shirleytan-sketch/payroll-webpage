import { Link, useParams } from 'react-router-dom'
import { getStation } from '../data/stations.js'
import { IconChevron } from '../components/icons.jsx'
import FfbReceptionReport from './stations/FfbReceptionReport.jsx'

const STATION_REPORTS = {
  'ffb-reception': FfbReceptionReport,
}

export default function StationReport() {
  const { slug } = useParams()
  const station = getStation(slug)

  if (!station) {
    return (
      <div className="content">
        <div className="page-head">
          <div>
            <h1>Station not found</h1>
          </div>
        </div>
        <Link className="btn" to="/report">
          Back to Station
        </Link>
      </div>
    )
  }

  const Icon = station.icon
  const StationBody = STATION_REPORTS[slug]

  return (
    <div className="content">
      <Link className="station-back" to="/report">
        <IconChevron size={14} />
        Back to Station
      </Link>

      <div className="page-head">
        <div className="station-header">
          <span className="station-header-icon" style={{ background: station.color }}>
            <Icon size={26} />
          </span>
          <div>
            <h1>{station.name}</h1>
            <p>Reports for this station</p>
          </div>
        </div>
      </div>

      {StationBody ? (
        <StationBody />
      ) : (
        <div className="placeholder-card">
          <h2>No reports added yet</h2>
          <p>Tell me what reports should show for {station.name} and I'll build them here.</p>
        </div>
      )}
    </div>
  )
}
