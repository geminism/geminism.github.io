import Link from "next/link";

export function AboutPage() {
  return (
    <main className="about-svg-page">
      <Link className="brand-back about-svg-back" href="/" aria-label="返回路牌首页">
        ← Index
      </Link>

      <div className="about-svg-canvas">
        <object
          className="about-svg-artwork"
          data="/about/about-page-text.svg?v=20260825-3"
          type="image/svg+xml"
          aria-label="Gemini Kong 关于我页面文字排版"
        >
          Gemini Kong 关于我页面文字排版
        </object>

        <aside className="about-svg-installation" aria-label="个人照片路牌装置">
          <span className="about-svg-pole" aria-hidden="true" />

          <div className="about-svg-photo">
            <img src="/about/photo.jpg?v=20260825" alt="Gemini Kong 个人照片" />
          </div>
          <div className="about-svg-collars" aria-hidden="true">
            <span className="about-svg-collar about-svg-collar-1" />
            <span className="about-svg-collar about-svg-collar-2" />
            <span className="about-svg-collar about-svg-collar-3" />
            <span className="about-svg-collar about-svg-collar-4" />
            <span className="about-svg-collar about-svg-collar-5" />
          </div>

          <img className="about-svg-cone" src="/about/traffic-cone-front.png" alt="橙白相间的正面交通路障" />
        </aside>
      </div>
    </main>
  );
}
