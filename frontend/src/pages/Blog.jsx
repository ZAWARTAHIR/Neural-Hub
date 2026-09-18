export default function Blog() {
  return (
    <section className="sec blog-page" style={{ borderBottom: "none" }}>
      <div className="shell">
        <div className="sec-head">
          <span className="badge badge-blog">Onefeed journal</span>
          <h1>Ideas for sharper marketing.</h1>
          <p>
            Practical notes on content systems, campaign planning, and turning
            one strong brief into work that travels across every channel.
          </p>
        </div>
        <div className="grid-3">
          <article className="card card-yellow">
            <div className="cap">Content systems</div>
            <div className="body">Build a repeatable content engine around one clear campaign idea.</div>
          </article>
          <article className="card card-blue">
            <div className="cap">Better briefs</div>
            <div className="body">Give your team and your automation the context they need to move quickly.</div>
          </article>
          <article className="card card-lime">
            <div className="cap">Channel thinking</div>
            <div className="body">Adapt one message into useful work for blogs, social, video, and WhatsApp.</div>
          </article>
        </div>
      </div>
    </section>
  );
}
