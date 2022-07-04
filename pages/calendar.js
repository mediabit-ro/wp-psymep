import React, { useEffect, useState } from "react";
import Head from "next/head";
import { withAuthSync } from "../utils/auth";
import fetch from "isomorphic-unfetch";
import nextCookie from "next-cookies";
import Layout from "../components/Layout";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import DateCell from "../components/DateCell";
import {
	formatDateHMS,
	getEndDate,
	colorSchema,
	formatDateYMD,
	getStartWeek,
	getEndWeek,
	selectTimes,
	checkAvailableTime,
} from "../utils";
import Router from "next/router";
import "moment/locale/ro";
import MobileHours from "../components/MobileHours";
import { Modal } from "react-bootstrap";
import ModalRez from "../components/BookingModal";
import store from "../store/store";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import recurrentBooking from "../utils/recurrentBooking";
import { nanoid } from "nanoid";

moment.locale("ro");

Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
};

function removeSeconds(string) {
	const stringArr = string.split(":");
	stringArr.pop();
	return stringArr.join(":");
}

const CalendarPage = observer((props) => {
	useEffect(() => {
		if (store.providers.length === 0) Router.push("/");
	}, []);

	const [view, setView] = useState(new Date());
	const localizer = momentLocalizer(moment);
	const [duration, setDuration] = useState(60);
	const [provider, setProvider] = useState();
	const [loading, setLoading] = useState(false);
	const [loadingBookings, setLoadingBookings] = useState(false);

	const [availableTimes, setAvailableTimes] = useState([]);
	const [selectedTime, setSelectedTime] = useState();
	const [modalData, setModalData] = useState();
	const [recurrent, setRecurrent] = useState(false);
	const [recurrentEvents, setRecurrentEvents] = useState(0);
	const [error, setError] = useState();

	// React bootstrap modal
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	const [showRez, setShowRez] = useState(false);
	const [dataRez, setDataRez] = useState();
	const [events, setEvents] = useState([]);
	const [times, setTimes] = useState([]);

	const selectEventHandler = (event) => {
		setShowRez(true);
		setDataRez(event);
	};

	useEffect(() => {
		setLoadingBookings(true);
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${props.token}`);

		var requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow",
		};
		let filter = "";
		if (store.activeProviders.length) {
			filter = "&categories=";
			store.activeProviders.forEach(
				(provider) => (filter += provider.id + ",")
			);
		}

		const now = formatDateYMD(new Date());
		const weekStart = formatDateYMD(getStartWeek(view));

		fetch(
			`https://mediabit.ro/booking/wp-json/wp/v2/posts/?data_start=${
				now > weekStart ? now : weekStart
			}&data_end=${formatDateYMD(getEndWeek(view))}&status=private&author=${
				props.id
			}` +
				filter +
				"&per_page=100",
			requestOptions
		)
			.then((response) => response.json())
			.then((result) => {
				setEvents(
					result.map((event) => {
						return {
							title: "Booking",
							start: new Date(event.acf.start_date),
							end: new Date(event.acf.end_date),
							provider_id: event.acf.provider_id,
							id: event.id,
						};
					})
				);
				setLoadingBookings(false);
			})
			.catch((error) => {
				console.log("error", error);
			});
	}, [view]);

	useEffect(() => {
		setLoadingBookings(true);
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${props.token}`);

		var requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow",
		};
		let filter = "";
		if (store.activeProviders.length) {
			filter = "&categories=";
			store.activeProviders.forEach(
				(provider) => (filter += provider.id + ",")
			);
		}
		fetch(
			`https://mediabit.ro/booking/wp-json/times/ocupied/?data_start=${formatDateYMD(
				getStartWeek(view)
			)}&data_end=${formatDateYMD(getEndWeek(view))}${filter}&author=${
				props.id
			}&per_page=100`,
			requestOptions
		)
			.then((response) => response.json())
			.then((result) => {
				setTimes(
					result.map((time) => ({
						title: time.title,
						start: new Date(time.start),
						end: new Date(time.end),
						provider_id: time.provider_id,
					}))
				);
				setLoadingBookings(false);
			})
			.catch((error) => {
				console.log("error", error);
			});
	}, [view, store.refreshTimes]);

	const addEventHandler = () => {
		setLoading(true);

		const modalDataObj = new Date(modalData);

		const endDate = new Date(modalDataObj.getTime() + duration * 60000);

		const addBooking = (modalData, recurrentId) => {
			const modalDataObj = new Date(modalData);

			const endDate = new Date(modalDataObj.getTime() + duration * 60000);

			var myHeaders = new Headers();
			myHeaders.append("Authorization", `Bearer ${props.token}`);

			var requestOptions = {
				method: "POST",
				headers: myHeaders,
				redirect: "follow",
			};

			var myHeaders = new Headers();
			myHeaders.append("Authorization", `Bearer ${props.token}`);
			myHeaders.append("Content-Type", "application/json");

			var raw = JSON.stringify({
				title: "Booking",
				content: "booking",
				status: "private",
				categories: [provider],
				acf: {
					client_id: 1,
					provider_id: provider,
					start_date: modalData,
					end_date: endDate,
					location: "1",
					status: "test",
					recurrent,
					filter_date: formatDateYMD(modalData),
					recurrent_id: recurrentId ? recurrentId : "",
				},
			});

			var requestOptions = {
				method: "POST",
				headers: myHeaders,
				body: raw,
				redirect: "follow",
			};

			fetch("https://mediabit.ro/booking/wp-json/wp/v2/posts", requestOptions)
				.then((response) => response.json())
				.then((result) => {
					if (
						formatDateYMD(new Date(result.acf.start_date)) <=
						formatDateYMD(getEndWeek(view))
					)
						setEvents([
							...events,
							{
								title: "Booking",
								start: new Date(result.acf.start_date),
								end: new Date(result.acf.end_date),
								provider_id: result.acf.provider_id,
							},
						]);
					setShowRez(false);
					setLoading(false);
					setShow(false);
					setProvider();
					setDuration(60);
					setRecurrent(false);
					setRecurrentEvents(0);
				})
				.catch((error) => console.log("error", error));
		};

		if (!provider) {
			setError("Selecteaza o camera.");
			setTimeout(() => {
				setError();
			}, 4000);
			setLoading(false);
		} else if (
			!checkAvailableTime(modalDataObj, endDate, provider, [
				...events,
				...times,
			])
		) {
			setError("Programarea se suprapune cu o alta rezervare.");
			setTimeout(() => {
				setError();
			}, 5000);
			setLoading(false);
		} else {
			if (!recurrent) addBooking(modalData);
			else {
				recurrentBooking(
					props.token,
					props.id,
					store.activeProviders,
					modalData,
					recurrentEvents,
					addBooking,
					duration,
					provider,
					setError,
					setLoading
				);
			}
		}
	};

	function eventStyleGetter(event) {
		const provider = store.providers.find(
			(provider) => provider.id === event.provider_id
		);

		let backgroundColor = provider ? provider.acf.culoare : "#fff",
			opacity;

		if (event.title) opacity = 0.8;
		else opacity = 0.4;

		var style = {
			backgroundColor,
			borderRadius: "0px",
			opacity,
			color: "black",
			border: "0px",
			display: "block",
			pointerEvents: event.title ? "auto" : "none",
		};
		return {
			style: style,
		};
	}

	const dayPropGetterHandler = (date) => {
		const today = Date.now();
		const inherit = new Date(date);
		if (inherit < today) {
			return {
				className: "date-in-function",
			};
		}
	};

	const durationHandler = (e) => {
		e.target.checked ? setDuration(90) : setDuration(60);
	};

	const slotSelectHandler = (data) => {
		if (new Date(data.start).getTime() > Date.now()) {
			handleShow();
			setModalData(data.start);
			setSelectedTime(removeSeconds(formatDateHMS(data.start)));
		}
	};

	const YourCalendarDateHeader = (data) => {
		const labelArr = data.label.split(" ");
		return (
			<>
				<div className='date-number'>{labelArr[0]}</div> {labelArr[1]}
			</>
		);
	};

	const recurentEventsHandler = (e) => {
		let value = Number(e.target.value);
		if (value > 60) value = 60;
		setRecurrentEvents(value);
	};

	return (
		<Layout>
			<Head>
				<title>Create Next App</title>
				<meta name='description' content='Generated by create next app' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<ModalRez
				showRez={showRez}
				setShowRez={setShowRez}
				data={dataRez}
				token={props.token}
				events={events}
				setEvents={setEvents}
			/>
			<Modal show={show} onHide={handleClose}>
				<Modal.Header closeButton>
					<div>
						<h5 className='w-100'>Adaugă eveniment</h5>
						<p className='small mb-0'>Selectează ora, durata si locatia</p>
					</div>
				</Modal.Header>
				<Modal.Body>
					<div className='text-capitalize d-flex align-items-center mb-2'>
						<i className='h4 bi bi-clock mb-0 me-3'></i>
						{new Date(modalData).toLocaleDateString("RO-ro", {
							weekday: "long",
							month: "long",
							day: "numeric",
						})}
						<span className='px-1'></span>
						<select
							className='form-control w-auto me-1'
							value={selectedTime}
							onChange={(e) => setSelectedTime(e.target.value)}>
							{selectTimes.map((time) => (
								<option key={Math.random()} value={time}>
									{time}
								</option>
							))}
						</select>
						- {getEndDate(selectedTime, duration)}
					</div>
					<div style={{ marginLeft: "40px" }}>
						<div className='form-check mb-2'>
							<input
								className='form-check-input'
								type='checkbox'
								value=''
								id='flexCheckChecked'
								onChange={(e) => durationHandler(e)}
							/>
							<label className='form-check-label'>
								Ședință de o oră și jumătate
							</label>
						</div>
						<div className='form-check mb-2'>
							<input
								className='form-check-input'
								type='checkbox'
								checked={recurrent}
								id='recurrentCheckbox'
								onChange={(e) => setRecurrent(!recurrent)}
							/>
							<label className='form-check-label'>
								Recurentă {recurrent && " (alege numarul de repetari)"}
							</label>
							{recurrent && (
								<input
									value={recurrentEvents}
									type='number'
									onInput={(e) => recurentEventsHandler(e)}
									className='form-control w-auto'
								/>
							)}
						</div>
					</div>
					<div className='d-flex align-items-center'>
						<i className='h4 mb-0 bi bi-geo-alt me-3'></i>
						<label>Alege camera</label>
					</div>
					<div className='form-check mb-2 ms-3'>
						<select
							className='form-control'
							value={provider}
							onChange={(e) => setProvider(e.target.value)}>
							<option value=''></option>
							{store.activeProviders.map((provider) => (
								<option key={Math.random()} value={provider.id}>
									{provider.name}
								</option>
							))}
						</select>
					</div>
					{error && (
						<div className='alert alert-danger' role='alert'>
							{error}
						</div>
					)}
					<div className='text-end pt-3'>
						<button
							disabled={loading || error}
							className='btn btn-primary px-5'
							onClick={addEventHandler}>
							Adaugă Rezervare{" "}
							{loading && (
								<div
									className='spinner-border spinner-border-sm'
									role='status'></div>
							)}
						</button>
					</div>
				</Modal.Body>
			</Modal>

			<div className={"loading-bookings" + (loadingBookings ? " active" : "")}>
				<MobileHours />
				<div className='calendar-wrap'>
					<Calendar
						localizer={localizer}
						events={[...events, ...times]}
						view='week'
						views={["week"]}
						min={new Date(2021, 2, 8, 7, 0)} // 8.00 AM
						max={new Date(2023, 2, 8, 23, 59)} // Max will be 6.00 PM!
						// endAccessor={({ end }) => new Date(end.getTime() - 2)}
						eventPropGetter={eventStyleGetter}
						startAccessor='start'
						selectable={true}
						onSelectEvent={selectEventHandler}
						onSelectSlot={slotSelectHandler}
						style={{ height: 500 }}
						components={{
							timeSlotWrapper: DateCell,
							week: {
								header: YourCalendarDateHeader,
							},
						}}
						messages={{
							next: ">",
							previous: "<",
							today: "Azi",
							month: "Luna",
							week: "Saptamana",
							day: "Zi",
						}}
						slotPropGetter={dayPropGetterHandler}
						onNavigate={(date, view) => {
							console.log("Navigate", date);
							setView(date);
						}}
						onView={(date, view) => {
							console.log("onView", view, date);
							setView(view);
						}}
					/>
				</div>
				{loadingBookings && (
					<div className='spinner-wrap'>
						<div
							className='spinner-grow bg-primary'
							style={{ width: "3rem", height: "3rem" }}></div>
					</div>
				)}
			</div>
		</Layout>
	);
});

CalendarPage.getInitialProps = (ctx) => {
	const { token, id } = nextCookie(ctx);

	if (!token || !id) Router.push("/login");

	return {
		token,
		id,
	};
};

export default withAuthSync(CalendarPage);
