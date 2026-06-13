export function HeroOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="anim-float-slow absolute top-[15%] right-[-8%] h-[380px] w-[380px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(195,52,139,0.55), transparent 64%)',
          filter: 'blur(48px)',
        }}
      />
      <div
        className="anim-float absolute bottom-[5%] left-[-6%] h-[320px] w-[320px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at 70% 50%, rgba(200,162,90,0.30), transparent 60%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="anim-float-slow absolute top-[5%] left-[20%] h-[200px] w-[200px] rounded-full"
        style={{
          animationDelay: '2s',
          background:
            'radial-gradient(circle at 50% 50%, rgba(195,52,139,0.28), transparent 64%)',
          filter: 'blur(36px)',
        }}
      />
    </div>
  );
}
