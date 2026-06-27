import Head from "next/head";

const KALYRA_URL = "https://app.kalyra.io/";

export default function Home() {
	return (
		<>
			<Head>
				<title>Kalyra</title>
				<meta name='description' content='Ne-am mutat pe Kalyra' />
				<meta name='robots' content='noindex' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main
				style={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "24px",
					background: "#f5f6f8",
					fontFamily:
						"system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
					color: "#1f2933",
				}}>
				<div
					style={{
						maxWidth: "560px",
						width: "100%",
						background: "#ffffff",
						borderRadius: "16px",
						boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
						padding: "40px 32px",
						lineHeight: 1.6,
					}}>
					<h1 style={{ marginTop: 0, fontSize: "26px" }}>Bună!</h1>
					<p>
						Suntem de acum pe noua platformă de rezervări, <strong>Kalyra</strong>!
					</p>
					<p>
						Dacă nu te-ai conectat încă, poți accesa aplicația aici:{" "}
						<a href={KALYRA_URL} style={{ color: "#2563eb" }}>
							{KALYRA_URL}
						</a>
					</p>

					<p style={{ marginBottom: "4px" }}>
						<strong>Date de conectare pentru prima autentificare:</strong>
					</p>
					<p style={{ marginTop: 0 }}>
						Email: adresa ta de email înregistrată în sistemul anterior
						<br />
						Parolă temporară: numărul tău de telefon
					</p>

					<p>
						Migrarea rezervărilor a fost realizată cu succes, deci nu trebuie să
						faci nimic — vei găsi totul în contul nou, exact cum l-ai lăsat.
					</p>

					<p style={{ marginBottom: "4px" }}>
						<strong>Ai nevoie de ajutor?</strong>
					</p>
					<p style={{ marginTop: 0 }}>
						💬 Folosește chat-ul din aplicație pentru suport rapid (monitorizăm
						noi din spate interacțiunea, și intervenim când este nevoie)
						<br />
						📞 Sau contactează-ne direct la telefon sau whatsapp pe numărul{" "}
						<a href='tel:+40726612904' style={{ color: "#2563eb" }}>
							0726 612 904
						</a>
					</p>

					<p>
						Mulțumesc pentru răbdare și abia aștept feedback din partea ta!
					</p>

					<p style={{ marginBottom: "28px" }}>
						Cu drag,
						<br />
						Ștefan Lățea
					</p>

					<a
						href={KALYRA_URL}
						style={{
							display: "inline-block",
							background: "#2563eb",
							color: "#ffffff",
							textDecoration: "none",
							fontWeight: 600,
							padding: "14px 28px",
							borderRadius: "10px",
							fontSize: "16px",
						}}>
						Accesează KALYRA
					</a>
				</div>
			</main>
		</>
	);
}
