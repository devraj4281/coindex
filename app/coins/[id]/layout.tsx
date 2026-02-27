export default function CoinDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        html, body { overflow: hidden !important; height: 100% !important; }
      `}</style>
      {children}
    </>
  );
}
