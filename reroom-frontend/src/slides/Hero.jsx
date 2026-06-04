import { useFlow } from '../context/FlowContext.jsx'
import BeforeAfter from '../components/BeforeAfter.jsx'

export default function Hero() {
  const { goTo } = useFlow()

  return (
    <div className="slide s1">
      <div className="blob s1-blob-a" />
      <div className="blob s1-blob-b" />
      <div className="blob s1-blob-c" />
      <div className="blob s1-blob-d" />

      <div className="s1-layout">
        <div className="s1-left">
          <h1 className="s1-headline">
            Your pieces<br />don't talk to<br />each other.
          </h1>
          <p className="s1-sub">
            Upload a photo of your room. We find real products that match your
            style and budget — then show you how your room looks before you buy a
            single thing.
          </p>

          <div className="s1-cta-row">
            <button className="btn-dark" onClick={() => goTo(1)}>
              Transform my room →
            </button>
          </div>

          <div className="s1-proof">
            <div className="s1-proof-text">
              No account needed · free to try
            </div>
          </div>
        </div>

        <div className="s1-right">
          <div className="s1-ba-wrap">
            <BeforeAfter before="/room-before.jpg" after="/room-after.png" auto />
          </div>

          <div className="s1-stat-row">
            <div className="s1-stat">
              <div className="s1-stat-num">$255</div>
              <div className="s1-stat-label">spent of $350 budget</div>
            </div>
            <div className="s1-stat">
              <div className="s1-stat-num">8</div>
              <div className="s1-stat-label">pieces matched</div>
            </div>
            <div className="s1-stat">
              <div className="s1-stat-num">2</div>
              <div className="s1-stat-label">pieces you own, kept</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
