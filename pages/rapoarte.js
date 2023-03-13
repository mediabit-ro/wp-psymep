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
	const [packages, setPackages] = useState([]);

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

	const downloadHandler = () => {
		const doc = new jsPDF({
			unit: "pt",
			format: [500, reportTemplateRef.current.offsetHeight + 150],
			autoPaging: false, // disable automatic paging
		});

		doc.html(reportTemplateRef.current, {
			callback: function (doc) {
				console.log(
					"HTML element height: ",
					reportTemplateRef.current.offsetHeight
				);
				console.log("PDF document height: ", doc.internal.pageSize.height);

				// Add manual page breaks to determine where the content is overflowing
				const pageCount = doc.internal.getNumberOfPages();
				for (let i = pageCount; i > 1; i--) {
					doc.deletePage(i);
				}
				console.log(
					"PDF document height after adding a page: ",
					doc.internal.pageSize.height
				);
				doc.save(`raport-${name}-${month}-${year}.pdf`);
			},
		});
	};

	const submitHandler = async () => {
		setLoading(true);

		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${props.token}`);

		var requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow",
		};

		// Get post type 'preturi'
		const response = await fetch(
			"http://psymep.test/wp-json/wp/v2/preturi?per_page=10",
			requestOptions
		);

		const preturi = await response.json();

		const {
			chirie_tip_1,
			chirie_tip_2,
			chirie_pe_jumatate_de_zi_tip_1,
			chirie_pe_jumatate_de_zi_tip_2,
			penalizare,
			chirie_luna,
		} = preturi[0].acf;

		fetch(
			`http://psymep.test/wp-json/v1/get-reports-single?month=${month}&year=${year}&user=${id}`,
			requestOptions
		)
			.then((response) => response.json())
			.then((result) => {
				console.log("res", result);
				setLoading(false);

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
							Ore: booking.ore,
							Cost: booking.cost,
						};

						return data;
					});

					// Insert packages
					const packages = [];

					console.log("DATA", result[0]);
					const data = result[0];

					let total1 = Number(data.post.tip1);
					let total2 = Number(data.post.tip2);

					bookings.push({
						Nume: `Total inchirieri pe ora`,
						Cabinet: "",
						Data: "",
						"Data anulare": "",
						Cost: total1 + total2,
					});

					// DEDUCERE CHIRIE LUNA PRECEDENTA
					let deducere = 0;
					if (data.post.deducere_chirie_luna_precedenta) {
						let total1 = Number(data.post.tip1);
						let total2 = Number(data.post.tip2);
						let total = total1 + total2;
						let free = chirie_luna;
						if (free > total) deducere = total;
						else deducere = chirie_luna;

						packages.push({
							Nume: `Ore incluse in chirie luna ${lunaCurenta}`,
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: -deducere,
						});
					}

					// BOOKING HALF DAY TIP 1
					if (Number(data.post.chirie_pe_jumatate_de_zi_tip_1)) {
						packages.push({
							Nume: "Chirie pe jumatate de zi, Tip 1",
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost:
								data.post.chirie_pe_jumatate_de_zi_tip_1 +
								"x" +
								chirie_pe_jumatate_de_zi_tip_1,
						});
					}

					// BOOKING HALF DAY TIP 2
					if (Number(data.post.chirie_pe_jumatate_de_zi_tip_2)) {
						packages.push({
							Nume: "Chirie pe jumatate de zi, Tip 2",
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost:
								data.post.chirie_pe_jumatate_de_zi_tip_2 +
								"x" +
								chirie_pe_jumatate_de_zi_tip_2,
						});
					}

					// CHIRIE LUNA IN CURS
					if (data.post.chirie_luna_in_curs) {
						packages.push({
							Nume: `Chirie luna ${lunaString}`,
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: chirie_luna,
						});
					}

					let total_inchirieri =
						total1 +
						total2 +
						data.post.chirie_pe_jumatate_de_zi_tip_2 *
							chirie_pe_jumatate_de_zi_tip_2 +
						data.post.chirie_pe_jumatate_de_zi_tip_1 *
							chirie_pe_jumatate_de_zi_tip_1;

					if (data.post.deducere_chirie_luna_precedenta) {
						total_inchirieri -= deducere;
					}

					if (data.post.chirie_luna_in_curs) {
						total_inchirieri += chirie_luna;
					}

					packages.push({
						Nume: `Total inchirieri`,
						Cabinet: "",
						Data: "",
						"Data anulare": "",
						Cost: total_inchirieri,
					});

					// PENALIZARE INTARZIERE PLATA
					if (data.post.penalizare_intarziere_plata) {
						packages.push({
							Nume: "Penalizare",
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: penalizare,
						});
					}

					// DISCOUNT CONFIRM TERMENI SI CONDITII
					if (
						data.post.discount_conform_termeni_si_conditii &&
						total1 + total2 > 1000
					) {
						packages.push({
							Nume: "Discount",
							Cabinet: "",
							Data: "",
							"Data anulare": "",
							Cost: (-1 * (total1 + total2 - 1000)) / 2,
						});
					}

					let reduced = total1 + total2;

					// Check if bookings is array
					// if (Array.isArray(bookings))
					// 	reduced += bookings
					// 		.map((item) => item.Cost)
					// 		.reduce((prev, curr) => {
					// 			console.log("Reduced", Number(prev));
					// 			return Number(prev) + Number(curr);
					// 		});

					reduced +=
						data.post.chirie_pe_jumatate_de_zi_tip_1 *
						chirie_pe_jumatate_de_zi_tip_1;
					reduced +=
						data.post.chirie_pe_jumatate_de_zi_tip_2 *
						chirie_pe_jumatate_de_zi_tip_2;

					if (data.post.penalizare_intarziere_plata) reduced += penalizare;

					if (
						data.post.discount_conform_termeni_si_conditii &&
						total1 + total2 > 1000
					)
						reduced += (-1 * (total1 + total2 - 1000)) / 2;

					if (data.post.chirie_luna_in_curs) reduced += chirie_luna;

					if (data.post.deducere_chirie_luna_precedenta) reduced -= deducere;

					packages.push({
						Nume: `Total`,
						Cabinet: "",
						Data: "",
						"Data anulare": "",
						Cost: reduced,
					});

					// packages.push({
					// 	Nume: `Numar total de ore`,
					// 	Cabinet: "",
					// 	Data: "",
					// 	"Data anulare": "",
					// 	Cost: (Number(Number(data.post.tip1)) + Number(Number(data.post.tip2))) / 60,
					// });

					setBookings(bookings);
					setPackages(packages);
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
					<div className='col-lg-6 mb-3'>
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
								src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVQAAABECAYAAADeM82aAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjEgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk2MDhBOUQxQ0IzQzExRUE4QjJFRkNERjBFNkI2QzcxIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk2MDhBOUQyQ0IzQzExRUE4QjJFRkNERjBFNkI2QzcxIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OTYwOEE5Q0ZDQjNDMTFFQThCMkVGQ0RGMEU2QjZDNzEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OTYwOEE5RDBDQjNDMTFFQThCMkVGQ0RGMEU2QjZDNzEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5W/VXUAAAZqUlEQVR42uxdB7hV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'
								alt='logo'
								width='128px'
								height='25.5px'
							/>
						</div>
						<div className='r-banner'>
							Raport Rezervari {lunaCurenta} {year}
						</div>
						<table className='table'>
							<thead>
								<tr>
									<th scope='col'>Nume</th>
									<th scope='col'>Cabinet</th>
									<th scope='col'>Data</th>
									<th scope='col'>Data anulare</th>
									<th scope='col'>Ore rezervate</th>
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
										<td>{booking.Ore}</td>
										<td>{booking.Cost} lei</td>
									</tr>
								))}
								{packages.map((booking) => (
									<tr key={Math.random()}>
										<th colSpan='4' scope='row'>
											{booking.Nume}
										</th>
										<td></td>
										<td>{booking.Cost} lei</td>
									</tr>
								))}
							</tbody>
						</table>
						<p className='text-center small'>
							Raportul de rezervari este emis conform Termenilor si conditiilor
							agreate.
						</p>
					</div>
				)}
			</div>
		</Layout>
	);
};

Rapoarte.getInitialProps = (ctx) => {
	const { token, id, adminId, name, terms } = nextCookie(ctx);

	if (!token || !id || !terms) Router.push("/login");

	return {
		token,
		id,
		adminId,
		name,
	};
};

export default withAuthSync(Rapoarte);
