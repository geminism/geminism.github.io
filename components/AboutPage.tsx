import Link from "next/link";

const BULB_COUNT = 16;

export function AboutPage() {
  return (
    <main className="about-page">
      <Link className="about-back" href="/" aria-label="返回首页">
        ← Index
      </Link>

      <div className="about-overhead" aria-hidden="true">
        <span className="about-rail-shadow" />
        <span className="about-rail" />
        <span className="about-rail-collar about-rail-collar-a" />
        <span className="about-rail-collar about-rail-collar-b" />
      </div>

      <div className="about-layout">
        <section className="about-installation" aria-label="悬挂式个人照片路牌装置">
          <div className="about-hanging-assembly">
            <span className="about-hanger about-hanger-left" aria-hidden="true" />
            <span className="about-hanger about-hanger-right" aria-hidden="true" />

            <div className="about-photo-sign">
              <div className="about-photo-bezel">
                <img
                  src="/brand/verge/1.jpg"
                  alt="个人照片占位图，之后将替换为正式照片"
                />
                <span className="about-photo-placeholder">Portrait pending</span>
              </div>

              <div className="about-lights" aria-hidden="true">
                {Array.from({ length: BULB_COUNT }, (_, index) => (
                  <span className="about-bulb" key={index} />
                ))}
              </div>
            </div>
          </div>

          <div className="about-traffic-cone" aria-hidden="true">
            <span className="about-cone-body">
              <i className="about-cone-band" />
            </span>
            <span className="about-cone-base" />
            <span className="about-cone-shadow" />
          </div>
        </section>

        <article className="about-copy">
          <header className="about-heading">
            <p className="about-kicker">About / 个人简介</p>
            <h1>GEMINI KONG</h1>
            <p className="about-name-zh" lang="zh-CN">孔 令杰</p>
            <p className="about-role">
              Graphic designer working across branding, packaging and visual communication.
            </p>
          </header>

          <div className="about-copy-rule" />

          <section className="about-profile-section" aria-labelledby="about-education-title">
            <h2 id="about-education-title">EDUCATION / 教育背景</h2>
            <div className="about-education-list">
              <article className="about-education-item">
                <h3>University of Leeds</h3>
                <div>
                  <p>MA Culture, Creativity and Entrepreneurship</p>
                  <p lang="zh-CN">利兹大学 · 文化、创意与创业硕士</p>
                </div>
              </article>
              <article className="about-education-item">
                <h3>Central University of Finance and Economics</h3>
                <div>
                  <p>LLB Law</p>
                  <p lang="zh-CN">中央财经大学 · 法学学士</p>
                </div>
              </article>
            </div>

            <aside className="about-law-note" aria-label="关于法律专业的手写注释">
              <span>yeah, I used to study law.</span>
              <span lang="zh-CN">对，我就是从法律转行过来的。</span>
            </aside>
          </section>

          <section className="about-currently" aria-labelledby="about-currently-title">
            <h2 id="about-currently-title">CURRENTLY / 最近在做什么</h2>
            <div>
              <p>Trying to make simple things less boring.</p>
              <p lang="zh-CN">努力避免想法滑向无聊。</p>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
