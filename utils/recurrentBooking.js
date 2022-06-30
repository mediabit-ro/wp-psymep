import { formatDateYMD, checkAvailableTime } from "../utils";
import { nanoid } from "nanoid";

function addDays(date, days) {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

export default function recurrentBooking(
	token,
	id,
	activeProviders,
	date,
	recurrentEvents,
	addBooking,
	duration,
	provider,
	setError,
	setLoading
) {
	const dateObj = new Date(date);

	var myHeaders = new Headers();
	myHeaders.append("Authorization", `Bearer ${token}`);

	var requestOptions = {
		method: "GET",
		headers: myHeaders,
		redirect: "follow",
	};
	let filter = "";
	if (activeProviders.length) {
		filter = "&categories=";
		activeProviders.forEach((provider) => (filter += provider.id + ","));
	}

	fetch(
		`https://mediabit.ro/booking/wp-json/times/ocupied/?data_start=${formatDateYMD(
			dateObj
		)}&data_end=${formatDateYMD(
			addDays(dateObj, 7 * (recurrentEvents - 1))
		)}${filter}&author=${id}&per_page=100&status=private`,
		requestOptions
	)
		.then((response) => response.json())
		.then((result) => {
			// Get times
			const times = result.map((time) => ({
				title: time.title,
				start: new Date(time.start),
				end: new Date(time.end),
				provider_id: time.provider_id,
			}));
			console.log(
				"Bookings url",
				`https://mediabit.ro/booking/wp-json/wp/v2/posts/?data_start=${formatDateYMD(
					dateObj
				)}&data_end=${formatDateYMD(
					addDays(dateObj, 7 * (recurrentEvents - 1))
				)}${filter}&author=${id}&per_page=100&status=private`
			);
			fetch(
				`https://mediabit.ro/booking/wp-json/wp/v2/posts/?data_start=${formatDateYMD(
					dateObj
				)}&data_end=${formatDateYMD(
					addDays(dateObj, 7 * (recurrentEvents - 1))
				)}${filter}&author=${id}&per_page=100&status=private`,
				requestOptions
			)
				.then((response) => response.json())
				.then((result) => {
					// Get bookings
					const bookings = result.map((event) => {
						return {
							title: "Booking",
							start: new Date(event.acf.start_date),
							end: new Date(event.acf.end_date),
							provider_id: event.acf.provider_id,
							id: event.id,
						};
					});
					// Check availabillity
					let availabillity = true;
					for (let index = 0; index < recurrentEvents; index++) {
						if (
							!checkAvailableTime(
								addDays(new Date(dateObj), 7 * index),
								new Date(dateObj.getTime() + duration * 60000),
								provider,
								[...bookings, ...times]
							)
						)
							availabillity = false;
					}
					console.log("Recurrent availabillity", availabillity);
					if (availabillity) {
						const recurrent_id = nanoid();
						for (let index = 0; index < recurrentEvents; index++) {
							console.log("Recurrent add booking", dateObj);
							addBooking(addDays(new Date(dateObj), 7 * index), recurrent_id);
						}
					} else {
						setError("O rezervare nu este disponibila.");
						setLoading(false);
						setTimeout(() => {
							setError("");
						}, 3000);
					}
				})
				.catch((error) => {
					console.log("error", error);
				});
		})
		.catch((error) => {
			console.log("error", error);
		});
}
