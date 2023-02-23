import React, { useEffect, useState, useRef } from "react";

import Head from "next/head";
import { withAuthSync } from "../utils/auth";
import fetch from "isomorphic-unfetch";
import nextCookie from "next-cookies";
import Router from "next/router";
import Layout from "../components/Layout";
import { set } from "mobx";
import jsPDF from "jspdf";
import Image from "next/image";

function formatDateEmail(date) {
	var d = new Date(date),
		month = "" + (d.getMonth() + 1),
		day = "" + d.getDate(),
		year = d.getFullYear(),
		minutes = d.getMinutes(),
		hours = d.getHours();

	if (month.length < 2) month = "0" + month;
	if (day.length < 2) day = "0" + day;
	if (minutes < 10) minutes = "0" + minutes;
	if (hours < 10) hours = "0" + hours;

	return [day, month, year].join(".") + " " + [hours, minutes].join(":");
}

const Rapoarte = (props) => {
	const { token, id, adminId, name } = props;

	const reportTemplateRef = useRef(null);

	const [month, setMonth] = useState("01");
	const [year, setYear] = useState("2022");
	const [loading, setLoading] = useState(false);
	const [bookings, setBookings] = useState([]);

	const downloadHandler = () => {
		var doc = new jsPDF({
			unit: "px",
			// autoPaging: false,
			onePage: true,
			format: [500, reportTemplateRef.current.offsetHeight + 150],
		});
		doc.html(reportTemplateRef.current, {
			async callback(doc) {
				await doc.save(`raport-${name}-${month}-${year}`);
			},
		});
	};

	const submitHandler = () => {
		setLoading(true);

		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${props.token}`);

		var requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow",
		};

		fetch(
			`https://mediabit.ro/booking-staging/wp-json/v1/get-reports-single?month=${month}&year=${year}&user=${id}`,
			requestOptions
		)
			.then((response) => response.json())
			.then((result) => {
				console.log("res", result);
				setLoading(false);

				let lunaString = "";
				let lunaCurenta = "";
				switch (month) {
					case "12":
						lunaString = "Ianuarie";
						break;
					case "01":
						lunaString = "Februarie";
						break;
					case "02":
						lunaString = "Martie";
						break;
					case "03":
						lunaString = "Aprilie";
						break;
					case "04":
						lunaString = "Mai";
						break;
					case "05":
						lunaString = "Iunie";
						break;
					case "06":
						lunaString = "Iulie";
						break;
					case "07":
						lunaString = "August";
						break;
					case "08":
						lunaString = "Septembrie";
						break;
					case "09":
						lunaString = "Octombrie";
						break;
					case "10":
						lunaString = "Noiembrie";
						break;
					case "11":
						lunaString = "Decembrie";
						break;
					default:
						break;
				}
				switch (month) {
					case "01":
						lunaCurenta = "Ianuarie";
						break;
					case "02":
						lunaCurenta = "Februarie";
						break;
					case "03":
						lunaCurenta = "Martie";
						break;
					case "04":
						lunaCurenta = "Aprilie";
						break;
					case "05":
						lunaCurenta = "Mai";
						break;
					case "06":
						lunaCurenta = "Iunie";
						break;
					case "07":
						lunaCurenta = "Iulie";
						break;
					case "08":
						lunaCurenta = "August";
						break;
					case "09":
						lunaCurenta = "Septembrie";
						break;
					case "10":
						lunaCurenta = "Octombrie";
						break;
					case "11":
						lunaCurenta = "Noiembrie";
						break;
					case "12":
						lunaCurenta = "Decembrie";
						break;
					default:
						break;
				}

				// Convert data to CSV
				if (result[0]) {
					bookings = result[0].post.programari;

					console.log("Bookings", bookings);

					bookings = bookings.map((booking) => {
						const data = {
							Nume: result[0].author,
							Cabinet: booking.cabinet,
							Data: booking.data,
							"Data anulare": booking.data_anulare ? booking.data_anulare : "",
							Cost: booking.cost,
						};

						return data;
					});

					// Insert packages
					const packages = [];

					console.log("DATA", result[0]);
					const data = result[0];

					let total1 = (data.post.tip1 / 60) * 25;
					let total2 = (data.post.tip2 / 60) * 30;

					// BOOKING HALF DAY TIP 1
					if (Number(data.post.chirie_pe_jumatate_de_zi_tip_1)) {
						packages.push({
							Nume: "Chirie pe jumatate de zi, Tip 1",
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: data.post.chirie_pe_jumatate_de_zi_tip_1 + "x" + 300,
						});
					}

					// BOOKING HALF DAY TIP 2
					if (Number(data.post.chirie_pe_jumatate_de_zi_tip_2)) {
						packages.push({
							Nume: "Chirie pe jumatate de zi, Tip 2",
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: data.post.chirie_pe_jumatate_de_zi_tip_2 + "x" + 400,
						});
					}

					// PENALIZARE INTARZIERE PLATA
					if (data.post.penalizare_intarziere_plata) {
						packages.push({
							Nume: "Penalizare intarziere plata",
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: 50,
						});
					}

					// DISCOUNT CONFIRM TERMENI SI CONDITII
					if (
						data.post.discount_conform_termeni_si_conditii &&
						total1 + total2 > 1000
					) {
						packages.push({
							Nume: "Discount conform Termeni si conditii",
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: (-1 * (total1 + total2 - 1000)) / 2,
						});
					}

					// CHIRIE LUNA IN CURS
					if (data.post.chirie_luna_in_curs) {
						packages.push({
							Nume: `Chirie luna ${lunaString}`,
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: 200,
						});
					}

					// DEDUCERE CHIRIE LUNA PRECEDENTA
					let deducere = 0;
					if (data.post.deducere_chirie_luna_precedenta) {
						let total1 = (data.post.tip1 / 60) * 25;
						let total2 = (data.post.tip2 / 60) * 30;
						let total = total1 + total2;
						let free = 200;
						if (free > total) deducere = total;
						else deducere = 200;

						packages.push({
							Nume: `Deducere chirie luna ${lunaCurenta}`,
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: -deducere,
						});
					}

					let reduced = 0;

					// Check if bookings is array
					if (Array.isArray(bookings))
						reduced += bookings
							.map((item) => item.Cost)
							.reduce((prev, curr) => {
								console.log("Reduced", Number(prev));
								return Number(prev) + Number(curr);
							});

					reduced += data.post.chirie_pe_jumatate_de_zi_tip_1 * 300;
					reduced += data.post.chirie_pe_jumatate_de_zi_tip_2 * 400;

					if (data.post.penalizare_intarziere_plata) reduced += 50;

					if (
						data.post.discount_conform_termeni_si_conditii &&
						total1 + total2 > 1000
					)
						reduced += (-1 * (total1 + total2 - 1000)) / 2;

					if (data.post.chirie_luna_in_curs) reduced += 200;

					if (data.post.deducere_chirie_luna_precedenta) reduced -= deducere;

					packages.push({
						Nume: `Total`,
						Cabinet: "",
						Data: "",
						"Data anulare": "",
						Cost: reduced,
					});

					packages.push({
						Nume: `Numar total de ore`,
						Cabinet: "",
						Data: "",
						"Data anulare": "",
						Cost: (Number(data.post.tip1) + Number(data.post.tip2)) / 60,
					});

					bookings = [...bookings, ...packages];
					setBookings(bookings);
				}
			})
			.catch((error) => {
				console.log("error", error);
				// Router.push("/login");
			});
	};

	return (
		<Layout adminId={adminId} name={name}>
			<Head>
				<title>Psymep</title>
				<meta name='description' content='Psymep' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='p-4'>
				<h3 className='mb-4'>Descarca rapoarte</h3>
				<div className='row'>
					<div className='col-lg-6 mb-3'>
						<select
							onChange={(e) => setMonth(e.target.value)}
							className='form-control'>
							<option value='01'>Ianuarie</option>
							<option value='02'>Februarie</option>
							<option value='03'>Martie</option>
							<option value='04'>Aprilie</option>
							<option value='05'>Mai</option>
							<option value='06'>Iunie</option>
							<option value='07'>Iulie</option>
							<option value='08'>August</option>
							<option value='09'>Septembrie</option>
							<option value='10'>Octombrie</option>
							<option value='11'>Noiembrie</option>
							<option value='12'>Decembrie</option>
						</select>
					</div>
					<div className='col-lg-6 mb-3'>
						<select
							onChange={(e) => setYear(e.target.value)}
							className='form-control'>
							<option value='2022'>2022</option>
							<option value='2023'>2023</option>
							<option value='2024'>2024</option>
							<option value='2025'>2025</option>
							<option value='2026'>2026</option>
							<option value='2027'>2027</option>
							<option value='2028'>2028</option>
						</select>
					</div>
					<div className='col-lg-6'>
						<button
							style={{ height: "38px" }}
							disabled={loading}
							onClick={submitHandler}
							className='btn btn-sm btn-primary w-100'>
							Afiseaza raport{" "}
							{loading && (
								<span
									className='spinner-border spinner-border-sm'
									role='status'
									aria-hidden='true'></span>
							)}
						</button>
					</div>
					<div className='col-lg-6'>
						{bookings.length !== 0 && (
							<button
								style={{ height: "38px" }}
								onClick={downloadHandler}
								className='btn btn-sm btn-primary w-100'>
								Descarca raport
							</button>
						)}
					</div>
				</div>
				{bookings.length !== 0 && (
					<div className='mt-4 raport' ref={reportTemplateRef}>
						<div className='m-2'>
							<Image
								src='/psymep.png'
								width='128'
								height='25.5'
								className='img-fluid'
							/>
						</div>
						<div className='r-banner'>Raport Rezervari</div>
						<table className='table'>
							<thead>
								<tr>
									<th scope='col'>Nume</th>
									<th scope='col'>Cabinet</th>
									<th scope='col'>Data</th>
									<th scope='col'>Data anulare</th>
									<th scope='col'>Cost</th>
								</tr>
							</thead>
							<tbody>
								{bookings.map((booking) => (
									<tr key={Math.random()}>
										<th scope='row'>{booking.Nume}</th>
										<td>{booking.Cabinet}</td>
										<td>
											{booking.Data
												? formatDateEmail(new Date(booking.Data))
												: ""}
										</td>
										<td>
											{booking["Data anulare"]
												? formatDateEmail(new Date(booking["Data anulare"]))
												: ""}
										</td>
										<td>{booking.Cost}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</Layout>
	);
};

Rapoarte.getInitialProps = (ctx) => {
	const { token, id, adminId, name } = nextCookie(ctx);

	if (!token || !id) Router.push("/login");

	return {
		token,
		id,
		adminId,
		name,
	};
};

export default withAuthSync(Rapoarte);
