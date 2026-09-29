export default function CarromGame() {
  return (
    <div style={{ width: "100%", height: "100vh", background: "#0f172a", margin: 0, padding: 0, overflow: "hidden" }}>
      <iframe 
        src="./carrom/index.html" 
        title="Carrom Game"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}