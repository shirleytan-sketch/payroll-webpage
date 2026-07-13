export default function Placeholder({ icon: Icon, title, description }) {
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="placeholder-card">
        <div className="placeholder-icon">
          <Icon size={20} />
        </div>
        <h2>{title} is coming next</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}
