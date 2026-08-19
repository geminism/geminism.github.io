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

          <div className="about-svg-photo">
            <img src="/about/photo.png" alt="Gemini Kong 个人照片" />
          </div>
          <span className="about-svg-collar" aria-hidden="true" />

          <img className="about-svg-cone" src="/about/traffic-cone.png" alt="橙白相间的交通路障" />
        </aside>
      </div>
    </main>
  );
}
