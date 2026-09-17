export default function About() {
  return (
    <section className="sec" style={{ borderBottom: "none" }}>
      <div className="shell">
        <div className="sec-head">
          <h2>About Onefeed</h2>
          <p>
            Onefeed is an internal platform built to support our marketing
            team. It connects a simple prompt-based interface to our
            automation workflows, so that blog posts, images, videos and
            WhatsApp messages can be produced from a single request and
            reviewed in one place before going out.
          </p>
        </div>
        <div className="sec-head">
          <h2>Why it exists</h2>
          <p>
            Marketing content used to be produced across several disconnected
            tools. Onefeed brings the request, the generation, and the review
            step into one dashboard, so the team can move faster without
            losing control over what gets published.
          </p>
        </div>
      </div>
    </section>
  );
}
