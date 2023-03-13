import React, { useEffect, useState } from "react";

import Head from "next/head";
import { withAuthSync } from "../utils/auth";
import fetch from "isomorphic-unfetch";
import nextCookie from "next-cookies";
import Router from "next/router";
import Layout from "../components/Layout";
import {
	formatDateYMD,
	formatDateReadable,
	formatDateDH,
	filterCanceled,
	getAllPosts,
	roTimezone,
} from "../utils";
import { observer } from "mobx-react-lite";
import store from "../store/store";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

Date.prototype.addDays = function (days) {
	var date = roTimezone(new Date(this.valueOf()));
	date.setDate(date.getDate() + days);
	return date;
};

const Rezerevari = observer((props) => {
	const [bookings, setBookings] = useState([]);
	const [canceledBookings, setCanceledBookings] = useState([]);
	const { token, id, adminId, name } = props;
	const [oldBookings, setOldBookings] = useState([]);
	const [oldCanceledBookings, setOldCanceledBookings] = useState([]);

	useEffect(() => {
		// Headers
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);
		var requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow",
		};

		// Get posts
		getAllPosts(
			formatDateYMD(roTimezone(new Date())), // data_start
			"20240121", // data_end
			"private", // status
			500, // per_page
			token, // token
			props.id, // author
			(posts) => {
				posts.sort((first, second) =>
					roTimezone(new Date(first.acf.start_date)) >
					roTimezone(new Date(second.acf.start_date))
						? 1
						: -1
				);
				let bookingsRaw = posts.map((event) => {
					return { ...event.acf, id: event.id };
				});
				let bookingsFinal = [];
				while (bookingsRaw.length !== 0) {
					let booking = bookingsRaw[0];
					if (booking.recurrent) {
						let recurrentBooking = {
							...booking,
							recurrentBookings: bookingsRaw.filter(
								(item) => item.recurrent_id == booking.recurrent_id
							),
						};
						bookingsFinal.push(recurrentBooking);
						bookingsRaw = bookingsRaw.filter(
							(item) => item.recurrent_id !== booking.recurrent_id
						);
					} else {
						bookingsFinal.push(booking);
						bookingsRaw.shift();
					}
				}
				setBookings(bookingsFinal);
			}
		);

		// Get canceled bookings
		// getAllPosts(
		// 	formatDateYMD(roTimezone(new Date()).addDays(-60)), // data_start
		// 	formatDateYMD(new Date()), // data_end
		// 	"trash", // status
		// 	500, // per_page
		// 	token, // token
		// 	props.id, // author
		// 	(posts) => {
		// 		console.log("Trash", posts);
		// 		setCanceledBookings(
		// 			posts.filter((booking) =>
		// 				filterCanceled(
		// 					booking.acf.start_date,
		// 					booking.date,
		// 					booking.modified,
		// 					booking
		// 				)
		// 			)
		// 		);
		// 	}
		// );

		// Get old bookings
		getAllPosts(
			formatDateYMD(roTimezone(new Date()).addDays(-60)), // data_start
			formatDateYMD(roTimezone(new Date()).addDays(-1)), // data_end
			"private", // status
			500, // per_page
			token, // token
			props.id, // author
			(posts) => {
				posts.sort((first, second) =>
					roTimezone(new Date(first.acf.start_date)) >
					roTimezone(new Date(second.acf.start_date))
						? 1
						: -1
				);
				let bookingsRaw = posts.map((event) => {
					return { ...event.acf, id: event.id };
				});
				let bookingsFinal = [];
				while (bookingsRaw.length !== 0) {
					let booking = bookingsRaw[0];
					if (booking.recurrent) {
						let recurrentBooking = {
							...booking,
							recurrentBookings: bookingsRaw.filter(
								(item) => item.recurrent_id == booking.recurrent_id
							),
						};
						bookingsFinal.push(recurrentBooking);
						bookingsRaw = bookingsRaw.filter(
							(item) => item.recurrent_id !== booking.recurrent_id
						);
					} else {
						bookingsFinal.push(booking);
						bookingsRaw.shift();
					}
				}
				setOldBookings(bookingsFinal);
			}
		);

		getAllPosts(
			formatDateYMD(roTimezone(new Date()).addDays(-31)), // data_start
			formatDateYMD(roTimezone(new Date())), // data_end
			"trash", // status
			500, // per_page
			token, // token
			props.id, // author
			(posts) => {
				console.log("Trash", posts);
				setOldCanceledBookings(
					posts.filter((booking) =>
						filterCanceled(
							booking.acf.start_date,
							booking.date,
							booking.modified,
							booking
						)
					)
				);
			}
		);

		// Get providers
		if (!store.providers.length) {
			fetch(
				"http://psymep.test/wp-json/wp/v2/categories?acf_format=standard&per_page=100",
				requestOptions
			)
				.then((response) => response.json())
				.then((result) => {
					console.log("res", result);
					store.providers = result.filter((item) => item.parent !== 0);
					store.locations = result.filter((item) => item.parent == 0);
				})
				.catch((error) => {
					Router.push("/login");
					console.log("error", error);
				});
		}
	}, []);

	// Cancel simple
	const cancelBookingHandler = (id, from) => {
		if (from) {
			const booking = from.recurrentBookings.find(
				(booking) => booking.id === id
			);
			booking.loading = true;
		} else {
			const booking = bookings.find((booking) => booking.id === id);
			booking.loading = true;
		}

		setBookings([...bookings]);
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);

		var requestOptions = {
			method: "DELETE",
			headers: myHeaders,
			redirect: "follow",
		};

		fetch(`http://psymep.test/wp-json/wp/v2/posts/${id}`, requestOptions)
			.then((response) => response.json())
			.then((result) => {
				console.log("result", result);
				if (from) {
					if (from.recurrentBookings.length > 1) {
						from.recurrentBookings.splice(
							from.recurrentBookings.findIndex(
								(booking) => booking.id === result.id
							),
							1
						);
					} else {
						const index = bookings.findIndex(
							(item) => item.recurrent_id === result.acf.recurrent_id
						);
						if (index !== -1) {
							bookings.splice(index, 1);
							setBookings([...bookings]);
						}
					}
					setBookings([...bookings]);
				} else {
					bookings.splice(
						bookings.findIndex((booking) => booking.id === result.id),
						1
					);
					setBookings([...bookings]);
				}
			})
			.catch((error) => {
				Router.push("/login");
				console.log("error", error);
			});
	};

	// Cancel recurrent
	const cancelBookingRecurrentHandler = (booking) => {
		booking.loading = true;
		setBookings([...bookings]);
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);
		var requestOptions = {
			method: "DELETE",
			headers: myHeaders,
			redirect: "follow",
		};

		let bookingsDeleted = 0;

		booking.recurrentBookings.forEach((value) => {
			fetch(
				`http://psymep.test/wp-json/wp/v2/posts/${value.id}`,
				requestOptions
			)
				.then((response) => response.json())
				.then((result) => {
					bookingsDeleted++;
					if (bookingsDeleted === booking.recurrentBookings.length) {
						const index = bookings.findIndex(
							(item) => item.recurrent_id === result.acf.recurrent_id
						);
						if (index !== -1) {
							bookings.splice(index, 1);
							setBookings([...bookings]);
						}
					}
				})
				.catch((error) => {
					Router.push("/login");
					console.log("error", error);
				});
		});
	};

	const getProviderName = (id) => {
		if (store.providers.length !== 0) {
			const provider = store.providers.find((provider) => provider.id === id);
			if (provider) return provider.name;
			else return "";
		} else return "";
	};

	const dropdownHandler = (booking) => {
		booking.dropdownState = !booking.dropdownState;
		setBookings([...bookings]);
	};

	console.log("Old bookings", oldBookings);

	return (
		<Layout adminId={adminId} name={name}>
			<Head>
				<title>Psymep</title>
				<meta name='description' content='Psymep' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='rez-list'>
				<Tabs defaultActiveKey='home'>
					<Tab eventKey='home' title='Lista rezervari'>
						<table className='table table-bordered'>
							<thead>
								<td>
									<strong>Cameră</strong>
								</td>
								<td>
									<strong>Dată</strong>
								</td>
								<td>
									<strong>Anulează</strong>
								</td>
							</thead>
							<tbody>
								{bookings.map((booking, index) => (
									<>
										<tr
											className={
												booking.dropdownState ? "recurrent-booking-head" : ""
											}
											key={Math.random()}>
											<td>{getProviderName(booking.provider_id)}</td>
											<td className='text-capitalize'>
												{booking.recurrent
													? formatDateDH(roTimezone(booking.start_date))
													: formatDateReadable(roTimezone(booking.start_date))}
											</td>
											<td>
												<button
													onClick={() =>
														booking.recurrent
															? cancelBookingRecurrentHandler(booking)
															: cancelBookingHandler(booking.id)
													}
													disabled={booking.loading}
													className='btn btn-primary px-4 py-2'>
													Anulează
													{booking.recurrent ? " recurentă" : " rezervare"}
													{booking.loading && (
														<div
															className='spinner-border spinner-border-sm ms-2 text-light'
															role='status'></div>
													)}
												</button>
											</td>
											<td>
												{booking.recurrent && (
													<div onClick={() => dropdownHandler(booking)}>
														{booking.dropdownState ? (
															<i className='bi bi-chevron-up p-3'></i>
														) : (
															<i className='bi bi-chevron-down p-3'></i>
														)}
													</div>
												)}
											</td>
										</tr>
										{booking.dropdownState &&
											booking.recurrentBookings
												.sort((cur, prev) => cur.filter_date - prev.filter_date)
												.map((recurrentBooking) => (
													<tr key={Math.random()} className='recurrent-booking'>
														<td>
															{getProviderName(recurrentBooking.provider_id)}
														</td>
														<td className='text-capitalize'>
															{formatDateReadable(
																roTimezone(recurrentBooking.start_date)
															)}
														</td>
														<td>
															<button
																disabled={recurrentBooking.loading}
																onClick={() =>
																	cancelBookingHandler(
																		recurrentBooking.id,
																		booking
																	)
																}
																className='btn btn-primary px-3 py-1 small'>
																Anulează rezervare
																{recurrentBooking.loading && (
																	<div
																		className='spinner-border spinner-border-sm ms-2 text-light'
																		role='status'></div>
																)}
															</button>
														</td>
														<td></td>
													</tr>
												))}
									</>
								))}
							</tbody>
						</table>
					</Tab>
					{/* <Tab eventKey='profile' title='Rezervari anulate'>
						<table className='table table-bordered'>
							<thead>
								<td>
									<strong>Cameră</strong>
								</td>
								<td>
									<strong>Dată</strong>
								</td>
								<td>
									<strong>Dată anulare</strong>
								</td>
							</thead>
							<tbody>
								{canceledBookings.map((booking, index) => (
									<>
										<tr key={Math.random()}>
											<td>{getProviderName(booking.acf.provider_id)}</td>
											<td className='text-capitalize'>
												{formatDateReadable(roTimezone(booking.acf.start_date))}
											</td>
											<td className='text-capitalize'>
												{formatDateReadable(booking.modified)}
											</td>
										</tr>
									</>
								))}
							</tbody>
						</table>
					</Tab> */}
					<Tab eventKey='old' title='Ultimele 60 de zile'>
						<table className='table table-bordered'>
							<thead>
								<td>
									<strong>Cameră</strong>
								</td>
								<td>
									<strong>Dată</strong>
								</td>
								<td>
									<strong>Dată anulare</strong>
								</td>
							</thead>
							<tbody>
								{oldBookings.map((booking, index) => (
									<>
										<tr key={Math.random()}>
											<td>{getProviderName(booking.provider_id)}</td>
											<td className='text-capitalize'>
												{formatDateReadable(roTimezone(booking.start_date))}
											</td>
											<td className='text-capitalize'></td>
										</tr>
									</>
								))}
								{oldCanceledBookings.map((booking, index) => (
									<>
										<tr key={Math.random()}>
											<td>{getProviderName(booking.acf.provider_id)}</td>
											<td className='text-capitalize'>
												{formatDateReadable(roTimezone(booking.acf.start_date))}
											</td>
											<td className='text-capitalize'>
												{formatDateReadable(booking.modified)}
											</td>
										</tr>
									</>
								))}
							</tbody>
						</table>
					</Tab>
				</Tabs>
			</div>
		</Layout>
	);
});

Rezerevari.getInitialProps = (ctx) => {
	const { token, id, adminId, name, terms } = nextCookie(ctx);

	if (!token || !id || !terms) Router.push("/login");

	return {
		token,
		id,
		adminId,
		name,
	};
};

export default withAuthSync(Rezerevari);
