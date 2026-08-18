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

        <span className="about-gull about-gull-a">
          <span className="about-gull-body" />
          <span className="about-gull-head" />
          <span className="about-gull-beak" />
          <span className="about-gull-leg" />
        </span>
        <span className="about-gull about-gull-b">
          <span className="about-gull-body" />
          <span className="about-gull-head" />
          <span className="about-gull-beak" />
          <span className="about-gull-leg" />
        </span>
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

          <div className="about-barrier" aria-hidden="true">
            <span className="about-barrier-board">
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="about-barrier-post about-barrier-post-left" />
            <span className="about-barrier-post about-barrier-post-right" />
            <span className="about-barrier-foot about-barrier-foot-left" />
            <span className="about-barrier-foot about-barrier-foot-right" />
          </div>
        </section>

        <article className="about-copy">
          <header className="about-heading">
            <p className="about-kicker">About / 个人简介</p>
            <h1>Kong Lingjie</h1>
            <p className="about-role">Graphic Designer</p>
          </header>

          <div className="about-copy-rule" />

          <div className="about-bilingual-copy">
            <section lang="zh-CN">
              <p>
                我是一名平面设计师，关注品牌识别、包装、编辑与活动视觉。我的工作常从日常环境中的标识、材料和偶然秩序出发，在清晰的信息结构里保留一点幽默、陌生感与不完美。
              </p>
              <p>
                我喜欢让平面设计走出纸面，通过物件、空间与动态交互建立更直接的观看体验。这个网站既是一份作品档案，也是一组仍在生长的路牌。
              </p>
            </section>

            <section lang="en">
              <p>
                I am a graphic designer working across visual identity, packaging, editorial and event design. My practice often begins with signs, materials and accidental orders found in everyday environments.
              </p>
              <p>
                I am interested in taking graphic design beyond the page, using objects, space and motion to build direct viewing experiences. This website is both an archive and a sign system still in progress.
              </p>
            </section>
          </div>

          <section className="about-experience" aria-labelledby="about-experience-title">
            <h2 id="about-experience-title">Selected experience / 个人经历</h2>
            <div className="about-experience-list">
              <div className="about-experience-row">
                <time>2025—Now</time>
                <p>Independent practice</p>
                <p>Visual identity, editorial and spatial graphics</p>
              </div>
              <div className="about-experience-row">
                <time>2024</time>
                <p>Selected projects</p>
                <p>Brand, packaging and event design</p>
              </div>
              <div className="about-experience-row">
                <time>2023</time>
                <p>Design studies</p>
                <p>Research-led visual communication</p>
              </div>
            </div>
            <p className="about-copy-note">Example copy — to be replaced with final biography and experience.</p>
          </section>
        </article>
      </div>
    </main>
  );
}
