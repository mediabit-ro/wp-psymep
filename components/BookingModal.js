import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import store from "../store/store";
import Link from "next/link";
import {
	formatDateHMS,
	formatDateYMD,
	formatDateReadableDM,
	roTimezone,
	selectTimes,
	getEndDate,
	formatDateHHMM
} from "./../utils";
import { set, toJS } from "mobx";

const generateValidSlots = (start, rangeInHours = 36) => {
  const slots = [];
  const now = Date.now();

  // Calculate range
  let startTime = now;
  const endTime = new Date(start).getTime() + rangeInHours * 60 * 60 * 1000;

  // Align startTime to the next 30-minute slot
  const startDate = new Date(startTime);
  startDate.setMinutes(
    startDate.getMinutes() + (30 - (startDate.getMinutes() % 30)) % 30,
    0,
    0
  );
  startTime = startDate.getTime();

  // Generate slots
  for (let ts = startTime; ts <= endTime; ts += 30 * 60 * 1000) {
    const slot = new Date(ts);
    const hour = slot.getHours();
    const minute = slot.getMinutes();

    // Only keep between 07:00 and 23:30
    if (hour >= 7 && (hour < 23 || (hour === 23 && minute === 0))) {
      slots.push(slot);
    }
  }

  return slots;
};

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
	const [editingBooking, setEditingBooking] = useState(false);
	const [editingBookingError, setEditingBookingError] = useState("");

	// Testing here
	const [showEdit, setShowEdit] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedTime, setSelectedTime] = useState();
	const [provider, setProvider] = useState();

	// Testing variables
	const allValidSlots = generateValidSlots(data ? data.start : "");

	// Unique dates from valid slots
	const uniqueDates = Array.from(
	new Set(allValidSlots.map(d => d.toDateString()))
	).map(d => new Date(d));
	const timesForSelectedDate = selectedDate
	? allValidSlots.filter(slot => slot.toDateString() === selectedDate.toDateString())
	: [];

	useEffect( () => {
		setSelectedTime(data ? formatDateHHMM(new Date(data.start)) : null);
		setSelectedDate( new Date(data ? data.start : null));
		setProvider( data ? store.providers.find( provider => provider.id == data.provider_id ).id : null );
	} ,[data]);

	useEffect(()=>{
		if(timesForSelectedDate[0]) {
			setSelectedTime(timesForSelectedDate[0].toLocaleTimeString("RO-ro", { hour: '2-digit', minute: '2-digit' }));
		}
	}, [selectedDate]);

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
	let startDateHours = "";

	if (data) {
		const date = new Date(data.start);

		const startDate = new Date(data.start);
		const endDate = new Date(data.end);
		startDateHours = formatDateHHMM(startDate);

		duration = endDate - startDate;

		duration = duration / 60000;

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

	const editBookingHandler = () => {
		setEditingBooking(true);
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);
		myHeaders.append("Content-Type", "application/json");

		let start_date = selectedDate;
		start_date.setHours(Number(selectedTime.split(":")[0]));
		start_date.setMinutes(Number(selectedTime.split(":")[1]));

		const duration = (new Date(data.end) - new Date(data.start));

		const end_date = new Date(start_date.getTime() + duration);

		var raw = JSON.stringify({
			acf: {
				start_date: start_date,
				end_date: end_date,
				provider_id: provider,
				modified: new Date(),
				filter_date: formatDateYMD(start_date)
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
					setEditingBookingError(result.message);
					setTimeout(() => {
						setEditingBookingError();
					}, 5000);
					setEditingBooking(false);
					return;
				}

				console.log({result});

				let event = events.find((event) => event.id === result.id)
				event.end = new Date(
					result.acf.end_date
				);
				event.start = new Date(
					result.acf.start_date
				);
				event.provider_id = provider;
				event.modified = result.acf.modified;
	

				setEvents([...events]);
				setShowRez(false);
				setEditingBooking(false);
				setShowEdit(false);
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
						{/* Starting test */}
						{ (data ? !data.modified : false) && <button onClick={ () => setShowEdit(!showEdit)  } className="btn btn-primary w-100 mb-3">Editează rezervarea</button> }
						
						{ showEdit && (data ? !data.modified : false) && <div className="bg-light p-3 mb-3">

							<select
								className="form-control w-100 mb-1"
								value={provider}
								onChange={(e) => {setProvider(e.target.value);}}
							>
								<option value="" disabled>Alege o locație</option>
								{store.providers.map((provider) => (
								<option key={provider.name + provider.id} value={provider.id}>
									{provider.name}
								</option>
								))}
							</select>

							<select
							className="form-control w-100 mb-1 text-capitalize"
							value={selectedDate.toDateString()}
							onChange={(e) => {
								const d = new Date(e.target.value);
								setSelectedDate(d);
							}}
							>
							{uniqueDates.map((d) => (
								<option key={d.toDateString()} value={d.toDateString()}>
								{d.toLocaleDateString("RO-ro", {
									weekday: "long",
									month: "long",
									day: "numeric",
								})}
								</option>
							))}
							</select>

							{/* Time selector */}
							<div className="d-flex align-items-center">
								<select
									className="form-control mb-1"
									value={selectedTime}
									onChange={(e) => {setSelectedTime(e.target.value);}}
								>
									<option value="" disabled>Alege o oră</option>
									{timesForSelectedDate.map((t) => (
									<option key={t.toISOString()} value={t.toLocaleTimeString("RO-ro", { hour: '2-digit', minute: '2-digit' })}>
										{t.toLocaleTimeString("RO-ro", { hour: '2-digit', minute: '2-digit' })}
									</option>
									))}
								</select>
								<span className="ps-1" style={{"min-width": "60px"}}> - {getEndDate(selectedTime, duration)}</span>
							</div>
							<button onClick={ ()=> editBookingHandler() } className="btn btn-primary rounded w-100 py-1" style={{ "fontSize": "0.9rem" }} disabled={ editingBooking || !( (provider !== data.provider_id) || ( selectedDate.getTime() !== new Date(data.start).getTime() ) || ( selectedTime !== new Date(data.start).toLocaleTimeString("RO-ro", { hour: '2-digit', minute: '2-digit' }) ))}>Modifică {editingBooking && (
									<div
										className='spinner-border spinner-border-sm ms-1'
										role='status'></div>
								)}</button>
							{editingBookingError && (
							<div className='alert alert-danger mt-2' role='alert'>
								{editingBookingError}
							</div>
						)}
						</div> }
						{/* Ending testing */}
						{duration == 60 && (
							<button
								disabled={extendBookingState || error}
								onClick={() => extendBookingHandler()}
								className='btn btn-outline-primary w-100 mb-3'>
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
								className='btn btn-outline-primary mb-3 px-5 w-100'>
								Google Calendar
							</a>
						</Link>
						<button
							onClick={() => cancelBookingHandler()}
							className='btn btn-primary px-5 w-100'>
							Anulează Rezervarea
						</button>
					</Modal.Body>
				</Modal>
			)}
		</>
	);
}
