import Link from "next/link";

export function AboutPage() {
  return (
    <main className="about-svg-page">
      <Link className="brand-back about-svg-back" href="/" aria-label="返回路牌首页">
        ← Index
      </Link>

      <div className="about-svg-canvas">
        <img
          className="about-svg-artwork"
          src="/about/about-page-text.svg"
          alt="Gemini Kong 关于我页面文字排版"
        />

        <aside className="about-svg-installation" aria-label="个人照片路牌装置">
          <span className="about-svg-pole" aria-hidden="true" />

          <div className="about-svg-photo" aria-label="个人照片占位">
            <span>照片</span>
          </div>

          <div className="about-svg-warning" aria-label="三角形装饰路牌">
            <span className="about-svg-warning-red" aria-hidden="true">
              <span className="about-svg-warning-white">
                <i className="about-svg-exclamation" />
                <i className="about-svg-eyes" />
              </span>
            </span>
          </div>

          <div className="about-svg-cone" aria-label="橙色路障" />
        </aside>
      </div>
    </main>
  );
}
