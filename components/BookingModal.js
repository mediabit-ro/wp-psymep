import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import store from "../store/store";
import Link from "next/link";
import {
	formatDateHMS,
	formatDateYMD,
	formatDateReadableDM,
	roTimezone,
} from "./../utils";
import { set, toJS } from "mobx";
export default function BookingModal({
	data,
	showRez,
	setShowRez,
	token,
	events,
	setEvents,
}) {
	const [extendBookingState, setExtendBookingState] = useState(false);
	const [error, setError] = useState();

	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const hours = date.getHours() - 3;
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();

		if (day < 10) day = "0" + day;
		if (month < 10) month = "0" + month;
		if (hours < 10) hours = "0" + hours;
		if (minutes < 10) minutes = "0" + minutes;
		if (seconds < 10) seconds = "0" + seconds;

		return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
	};

	let duration = 0;

	if (data) {
		const date = new Date(data.start);

		// Convert date to '20230428T090000Z'

		const startDate = new Date(data.start);
		const endDate = new Date(data.end);

		duration = endDate - startDate;

		duration = duration / 60000;

		console.log("Data", formatDate(date), duration);
	}

	const cancelBookingHandler = () => {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);

		var requestOptions = {
			method: "DELETE",
			headers: myHeaders,
			redirect: "follow",
		};

		fetch(
			`${process.env.NEXT_PUBLIC_URL}/wp-json/wp/v2/posts/${data.id}`,
			requestOptions
		)
			.then((response) => response.json())
			.then((result) => {
				console.log("result", result);
				events.splice(
					events.findIndex((event) => event.id === result.id),
					1
				);
				setEvents([...events]);
				setShowRez(false);
			})
			.catch((error) => {
				console.log("error", error);
			});
	};

	const extendBookingHandler = () => {
		setExtendBookingState(true);
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);
		myHeaders.append("Content-Type", "application/json");

		console.log("data", data);

		let end_date = new Date(data.end);
		end_date.setMinutes(end_date.getMinutes() + 30);

		var raw = JSON.stringify({
			acf: {
				start_date: new Date(data.start),
				end_date: end_date,
				provider_id: data.provider_id,
			},
		});

		var requestOptions = {
			method: "PUT",
			headers: myHeaders,
			body: raw,
			redirect: "follow",
		};

		fetch(
			`${process.env.NEXT_PUBLIC_URL}/wp-json/wp/v2/posts/${data.id}`,
			requestOptions
		)
			.then((response) => response.json())
			.then((result) => {
				console.log(result);
				// Find the event and change it's end date
				if (result.code === "booking_exists") {
					setError(result.message);
					setTimeout(() => {
						setError();
					}, 5000);
					setExtendBookingState(false);
					return;
				}
				events.find((event) => event.id === result.id).end = new Date(
					result.acf.end_date
				);
				setEvents([...events]);
				setShowRez(false);
				setExtendBookingState(false);
			})
			.catch((error) => {
				console.log("error", error);
			});
	};

	return (
		<>
			{data && (
				<Modal show={showRez} onHide={() => setShowRez(false)}>
					<Modal.Header closeButton>
						<div>
							<h5 className='w-100'>Rezervare</h5>
						</div>
					</Modal.Header>
					<Modal.Body>
						<table className='table table-bordered'>
							<thead>
								<tr>
									<th scope='col'>Cabinet</th>
									<th scope='col'>Dat</th>
									<th scope='col'>Oră</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>
										{
											store.providers.find(
												(provider) => provider.id == data.provider_id
											).name
										}
									</td>
									<td>{formatDateReadableDM(data.start)}</td>
									<td>{formatDateHMS(data.start)}</td>
								</tr>
							</tbody>
						</table>
						{duration == 60 && (
							<button
								disabled={extendBookingState || error}
								onClick={() => extendBookingHandler()}
								className='btn btn-outline-primary w-100'>
								Prelungeste cu 30
								{extendBookingState && (
									<div
										className='spinner-border spinner-border-sm ms-1'
										role='status'></div>
								)}
							</button>
						)}
						{error && (
							<div className='alert alert-danger' role='alert'>
								{error}
							</div>
						)}
						<Link
							href={`https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${formatDate(
								data.start
							)}/${formatDate(data.end)}&text=Psymep`}>
							<a
								target='_blank'
								className='btn btn-outline-primary mt-3 px-5 w-100'>
								Google Calendar
							</a>
						</Link>
						<button
							onClick={() => cancelBookingHandler()}
							className='btn btn-primary mt-3 px-5 w-100'>
							Anulează Rezervarea
						</button>
					</Modal.Body>
				</Modal>
			)}
		</>
	);
}
