export default function App() {
	return (
		<main
			style={
        { 
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				gap: "1rem",
			}
      .btn_hero {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }
    }
		>
			<button type="button" className="btn_hero">webmail</button>
			<button type="button" className="btn_hero">ecampus</button>
      <div>
        <button type="button" className="btn_hero">Create account</button>
      </div>
		</main>
	);
}
