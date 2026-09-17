import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell">
          <h1>One prompt. Every channel, handled.</h1>
          <p className="lede">
            Onefeed is our internal platform for generating and publishing
            marketing content. Write a single prompt, and it turns into a
            blog post, images, a video, and a WhatsApp message — ready to
            review from one dashboard.
          </p>
          <div className="cta">
            <Link to="/dashboard" className="btn btn-blue">
              Open Dashboard
            </Link>
            <Link to="/about" className="btn btn-yellow">
              Learn how it works
            </Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="shell">
          <div className="sec-head">
            <h2>Four outputs, one dashboard</h2>
            <p>
              Every prompt can generate content across four channels. Each
              one has its own space in the dashboard, colour-coded so it is
              always clear what you are looking at.
            </p>
          </div>
          <div className="grid-4">
            <div className="card card-yellow">
              <div className="cap">Blog</div>
              <div className="body">
                Long-form posts generated from a short brief, ready for
                review and publishing.
              </div>
            </div>
            <div className="card card-red">
              <div className="cap">Image</div>
              <div className="body">
                On-brand visuals for feeds, stories and campaigns, generated
                in the sizes you need.
              </div>
            </div>
            <div className="card card-blue">
              <div className="cap">Video</div>
              <div className="body">
                Short-form video content generated from the same prompt, cut
                for social platforms.
              </div>
            </div>
            <div className="card card-lime">
              <div className="cap">WhatsApp</div>
              <div className="body">
                Broadcast-ready messages for customer and community
                channels.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="shell">
          <div className="sec-head">
            <h2>How it works</h2>
            <p>The heavy lifting happens behind the scenes.</p>
          </div>
          <div className="grid-3">
            <div className="step">
              <div className="num">1</div>
              <h3>Write a prompt</h3>
              <p>
                Describe the campaign or update in plain language from the
                dashboard chat.
              </p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <h3>Automation runs</h3>
              <p>
                The request is sent to our automation workflows, which
                generate the content.
              </p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h3>Review and publish</h3>
              <p>
                Check the result in the dashboard before it goes out to any
                channel.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="closer">
        <div className="shell">
          <h2>Ready to draft the next campaign?</h2>
          <p>Open the dashboard and start with a single prompt.</p>
          <Link to="/dashboard" className="btn btn-yellow">
            Open Dashboard
          </Link>
        </div>
      </section>
    </>
  );
}
