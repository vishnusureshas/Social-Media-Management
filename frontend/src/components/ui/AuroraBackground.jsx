const AuroraBackground = () => (
  <div className="aurora-bg" aria-hidden="true">
    <div
      className="blob animate-blob"
      style={{ width: '520px', height: '520px', top: '-8%', left: '-6%', background: 'linear-gradient(135deg,#818cf8,#e879f9)' }}
    />
    <div
      className="blob animate-blob"
      style={{ width: '460px', height: '460px', right: '-5%', top: '20%', background: 'linear-gradient(135deg,#60a5fa,#34d399)', animationDelay: '-4s' }}
    />
    <div
      className="blob animate-float-slow"
      style={{ width: '420px', height: '420px', bottom: '-10%', left: '25%', background: 'linear-gradient(135deg,#fbbf24,#fb7185)', animationDelay: '-2s' }}
    />
    <div
      className="blob animate-float"
      style={{ width: '300px', height: '300px', bottom: '10%', right: '20%', background: 'linear-gradient(135deg,#e879f9,#60a5fa)', animationDelay: '-6s' }}
    />
  </div>
);

export default AuroraBackground;