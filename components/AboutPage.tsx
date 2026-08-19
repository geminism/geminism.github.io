import Link from "next/link";

function Range({ from, to }: { from: string; to: string }) {
  return (
    <span className="about-plan-range" aria-label={`${from} 至 ${to}`}>
      <span>{from}</span>
      <i />
      <span>{to}</span>
    </span>
  );
}

export function AboutPage() {
  return (
    <main className="about-plan-page">
      <Link className="about-plan-back" href="/" aria-label="返回首页">
        ← Index
      </Link>

      <aside className="about-plan-installation" aria-label="个人照片路牌与路障装置">
        <span className="about-plan-pole" aria-hidden="true" />
        <div className="about-plan-photo-sign">
          <div className="about-plan-photo-frame">
            <img src="/brand/verge/1.jpg" alt="个人照片临时占位图" />
            <span>照片</span>
          </div>
        </div>
        <div className="about-plan-cone" aria-hidden="true">
          <span className="about-plan-cone-face" />
        </div>
      </aside>

      <article className="about-plan-copy">
        <header className="about-plan-intro">
          <div className="about-plan-name">
            <h1>GEMINI KONG</h1>
            <p lang="zh-CN">孔 令杰</p>
          </div>
          <span className="about-plan-slash" aria-hidden="true">/</span>
          <p className="about-plan-role">
            Graphic designer<br />
            working across<br />
            branding,<br />
            packaging<br />
            and visual communication.
          </p>
        </header>

        <section className="about-plan-section about-plan-what">
          <h2><span>WHAT I DO</span><b>/</b><span lang="zh-CN">设计方向</span></h2>
          <p>Branding <i>•</i> Packaging <i>•</i> Campaigns <i>•</i> Visual Systems</p>
        </section>

        <section className="about-plan-section about-plan-education">
          <h2><span>EDUCATION</span><b>/</b><span lang="zh-CN">教育经历</span></h2>
          <div className="about-plan-records">
            <div className="about-plan-record">
              <Range from="25.09" to="26.08" />
              <div className="about-plan-record-main">
                <strong>University of Leeds</strong>
                <span>MA Culture, Creativity and Entrepreneurship</span>
              </div>
              <p lang="zh-CN">文化、创意与创业硕士<br />利兹大学</p>
            </div>
            <div className="about-plan-record about-plan-law-record">
              <Range from="20.09" to="24.07" />
              <div className="about-plan-record-main">
                <strong>Central University of Finance and Economics</strong>
                <span>LLB Law</span>
              </div>
              <p lang="zh-CN">法学学士<br />中央财经大学</p>
              <aside className="about-plan-law-note">
                yeah, I used to study law.<br />
                <span lang="zh-CN">对，我就是从法律转行过来的。</span>
              </aside>
            </div>
          </div>
        </section>

        <section className="about-plan-section about-plan-experience">
          <h2><span>EXPERIENCE</span><b>/</b><span lang="zh-CN">工作经历</span></h2>
          <div className="about-plan-records">
            <div className="about-plan-record">
              <Range from="25.05" to="25.08" />
              <div className="about-plan-record-main">
                <strong>Beijing Good for All</strong>
                <span>Project Assistant &amp; Visual Designer (Intern)</span>
              </div>
              <p lang="zh-CN">项目助理&amp;平面设计（实习）<br />北京一切都好</p>
            </div>
            <div className="about-plan-record">
              <Range from="25.02" to="now" />
              <div className="about-plan-record-main">
                <strong>JX Creative Studio</strong>
                <span>Visual Designer (Part-time)</span>
              </div>
              <p lang="zh-CN">平面设计（兼职）<br />激星创意工作室</p>
            </div>
          </div>
        </section>

        <section className="about-plan-current">
          <h2>CURRENTLY <b>/</b> <span lang="zh-CN">最近在做什么</span></h2>
          <p>Trying to make simple things less boring.</p>
          <p lang="zh-CN">努力避免想法滑向无聊。</p>
        </section>
      </article>
    </main>
  );
}
