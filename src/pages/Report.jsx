import { Link } from 'react-router-dom'
import { stations } from '../data/stations.js'

export default function Report() {
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>Station</h1>
          <p>Select a station to open its reports</p>
        </div>
      </div>

      <div className="station-launcher">
        {stations.map(({ slug, name, icon: Icon, color }) => (
          <Link key={slug} to={`/report/${slug}`} className="station-tile">
            <span className="station-tile-icon" style={{ background: color }}>
              <Icon size={30} />
            </span>
            <span className="station-tile-name">{name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
