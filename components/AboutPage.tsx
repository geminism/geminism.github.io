import Link from "next/link";

function DateRange({ start, end }: { start: string; end: string }) {
  const renderDate = (value: string) => (
    <span>
      {[...value].map((character, index) => character === "4"
        ? <b className="about-coordinate-number-fallback" key={`${character}-${index}`}>4</b>
        : character)}
    </span>
  );

  return (
    <div className="about-coordinate-date" aria-label={`${start} 至 ${end}`}>
      {renderDate(start)}
      <i aria-hidden="true" />
      {renderDate(end)}
    </div>
  );
}

export function AboutPage() {
  return (
    <main className="about-coordinate-page">
      <div className="about-coordinate-canvas">
        <Link className="about-coordinate-back" href="/" aria-label="返回首页">
          ← Index
        </Link>

        <aside className="about-coordinate-installation" aria-label="个人照片路牌装置">
          <span className="about-coordinate-pole" aria-hidden="true" />

          <div className="about-coordinate-photo" aria-label="个人照片占位">
            <span>照片</span>
          </div>

          <div className="about-coordinate-warning" aria-label="三角形装饰路牌">
            <span className="about-coordinate-warning-red" aria-hidden="true">
              <span className="about-coordinate-warning-white">
                <i className="about-coordinate-exclamation" />
                <i className="about-coordinate-eyes" />
              </span>
            </span>
          </div>

          <div className="about-coordinate-cone" aria-label="橙色路障" />
        </aside>

        <article className="about-coordinate-copy">
          <header className="about-coordinate-intro">
            <div className="about-coordinate-name">
              <h1>GEMINI KONG</h1>
              <p lang="zh-CN">孔 令杰</p>
            </div>
            <span className="about-coordinate-slash" aria-hidden="true">/</span>
            <p className="about-coordinate-role">
              Graphic designer<br />
              working across<br />
              branding,<br />
              packaging<br />
              and visual communication.
            </p>
          </header>

          <section className="about-coordinate-what" aria-labelledby="about-what-title">
            <h2 id="about-what-title">
              <span>WHAT I DO</span>
              <b>/</b>
              <span lang="zh-CN">设计方向</span>
            </h2>
            <p>Branding • Packaging • Campaigns • Visual Systems</p>
          </section>

          <section className="about-coordinate-section about-coordinate-education" aria-labelledby="about-education-title">
            <h2 id="about-education-title">
              <span>EDUCATION</span>
              <b>/</b>
              <span lang="zh-CN">教育经历</span>
            </h2>

            <div className="about-coordinate-row">
              <DateRange start="25.09" end="26.08" />
              <div className="about-coordinate-english">
                <p>University of Leeds</p>
                <p>MA Culture, Creativity and Entrepreneurship</p>
              </div>
              <div className="about-coordinate-chinese" lang="zh-CN">
                <p>文化、创意与创业硕士</p>
                <p>利兹大学</p>
              </div>
            </div>

            <div className="about-coordinate-row about-coordinate-law-row">
              <DateRange start="20.09" end="24.07" />
              <div className="about-coordinate-english">
                <p>Central University of Finance and Economics</p>
                <p>LLB Law</p>
              </div>
              <div className="about-coordinate-chinese" lang="zh-CN">
                <p>法学学士</p>
                <p>中央财经大学</p>
              </div>
              <aside className="about-coordinate-note">yeah, I used to study law...</aside>
            </div>
          </section>

          <section className="about-coordinate-section about-coordinate-experience" aria-labelledby="about-experience-title">
            <h2 id="about-experience-title">
              <span>EXPERIENCE</span>
              <b>/</b>
              <span lang="zh-CN">工作经历</span>
            </h2>

            <div className="about-coordinate-row">
              <DateRange start="25.05" end="25.08" />
              <div className="about-coordinate-english">
                <p>Beijing Good for All</p>
                <p>Project Assistant <span className="about-coordinate-punctuation">&amp;</span> Visual Designer <span className="about-coordinate-punctuation">(</span>Intern<span className="about-coordinate-punctuation">)</span></p>
              </div>
              <div className="about-coordinate-chinese" lang="zh-CN">
                <p>项目助理&amp;平面设计（实习）</p>
                <p>北京一切都好</p>
              </div>
            </div>

            <div className="about-coordinate-row">
              <DateRange start="25.02" end="now" />
              <div className="about-coordinate-english">
                <p>JX Creative Studio</p>
                <p>Visual Designer <span className="about-coordinate-punctuation">(</span>Part<span className="about-coordinate-punctuation">-</span>time<span className="about-coordinate-punctuation">)</span></p>
              </div>
              <div className="about-coordinate-chinese" lang="zh-CN">
                <p>平面设计（兼职）</p>
                <p>激星创意工作室</p>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
