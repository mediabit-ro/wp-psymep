import axios from "axios";

export function formatDateHMS(date) {
	var d = new Date(date),
		hours = "" + d.getHours(),
		minutes = "" + d.getMinutes(),
		seconds = "" + d.getSeconds();

	if (hours.length < 2) hours = "0" + hours;
	if (minutes.length < 2) minutes = "0" + minutes;
	if (seconds.length < 2) seconds = "0" + seconds;

	return [hours, minutes, seconds].join(":");
}

// function getDayName(dateStr, locale)
// {
//     var date = new Date(dateStr);
//     return ;
// }

export function formatDateReadable(date) {
	var d = new Date(date),
		hours = "" + d.getHours(),
		minutes = "" + d.getMinutes(),
		dayName = d.toLocaleDateString("ro-RO", { weekday: "long" }),
		day = d.getDate(),
		monthName = d.toLocaleString("ro-RO", { month: "long" });

	if (hours.length < 2) hours = "0" + hours;
	if (minutes.length < 2) minutes = "0" + minutes;

	return `${dayName} ${day} ${monthName}, ora ${hours}:${minutes}`;
}

export function formatDateDH(date) {
	var d = new Date(date),
		hours = "" + d.getHours(),
		minutes = "" + d.getMinutes(),
		dayName = d.toLocaleDateString("ro-RO", { weekday: "long" });

	if (hours.length < 2) hours = "0" + hours;
	if (minutes.length < 2) minutes = "0" + minutes;

	return `${dayName} , ora ${hours}:${minutes}`;
}

export function formatDateYMDHM(date) {
	var d = new Date(date),
		month = "" + (d.getMonth() + 1),
		day = "" + d.getDate(),
		year = d.getFullYear(),
		hours = "" + d.getHours(),
		minutes = "" + d.getMinutes();

	if (month.length < 2) month = "0" + month;
	if (day.length < 2) day = "0" + day;
	if (hours.length < 2) hours = "0" + hours;
	if (minutes.length < 2) minutes = "0" + minutes;

	return [year, month, day].join("/") + " - " + hours + ":" + minutes;
}

export function formatDateYMD(date) {
	var d = new Date(date),
		month = "" + (d.getMonth() + 1),
		day = "" + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = "0" + month;
	if (day.length < 2) day = "0" + day;

	return [year, month, day].join("");
}

function removeSeconds(string) {
	const stringArr = string.split(":");
	stringArr.pop();
	return stringArr.join(":");
}

export function getEndDate(selectedTime, duration) {
	if (selectedTime) {
		const selectedTimeArr = selectedTime.split(":");
		const selectedTimeValue =
			Number(selectedTimeArr[0]) * 60 + Number(selectedTimeArr[1]) + duration;
		return (
			doubleDigit(parseInt(selectedTimeValue / 60)) +
			":" +
			doubleDigit(selectedTimeValue % 60)
		);
	} else return "00:00";
}

export function getStartWeek(d) {
	d = new Date(d);
	var day = d.getDay(),
		diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
	return new Date(d.setDate(diff));
}

export function getEndWeek(d) {
	d = new Date(d);
	var day = d.getDay(),
		diff = d.getDate() - day + (day == 0 ? -6 : 1) + 6; // adjust when day is sunday
	return new Date(d.setDate(diff));
}

function doubleDigit(string) {
	if (String(string).length < 2) return "0" + string;
	else return String(string);
}

export function calculateAvailableTimes(intervals, duration) {
	console.log("calculate", duration);
	const times = [];
	intervals.forEach((interval) => {
		const intervalFromArr = interval.from.split(":");
		intervalFromArr.pop();
		const intervalFromValue =
			Number(intervalFromArr[0]) * 60 + Number(intervalFromArr[1]);
		const intervalToArr = interval.to.split(":");
		intervalToArr.pop();
		const intervalToValue =
			Number(intervalToArr[0]) * 60 + Number(intervalToArr[1]);
		for (
			let pace = intervalFromValue;
			pace + duration <= intervalToValue;
			pace += 30
		) {
			times.push(
				doubleDigit(parseInt(pace / 60)) + ":" + doubleDigit(pace % 60)
			);
		}
	});
	return times;
}

export function getWordpressBookings() {
	let clientBookings = [];
	axios
		.get("https://mediabit.ro/booking/wp-json/wp/v2/posts")
		.then((res) => {
			console.log("Res getWordpressBookings", res.data);
			clientBookings = res.data.map((booking) => booking.acf);
		})
		.catch((err) => {
			console.log("Err getWordpressBookings", err.message);
		});
	return clientBookings;
}

export function generateProvidersUrl(activeProviders) {
	console.log("Generate url", toJS(activeProviders));
	const providersMap = {
		1: 5,
		2: 6,
		3: 7,
		4: 8,
		5: 9,
		6: 10,
		7: 11,
		8: 12,
		9: 13,
		10: 14,
		11: 15,
		12: 16,
		13: 17,
	};
	let url = "https://mediabit.ro/booking/wp-json/wp/v2/posts?categories=";
	activeProviders.forEach((provider) => {
		url += providersMap[provider.id] + ",";
	});
	return url;
}

export const simplyToWpSchema = {
	1: 5,
	2: 6,
	3: 7,
	4: 8,
	5: 9,
	6: 10,
	7: 11,
	8: 12,
	9: 13,
	10: 14,
	11: 15,
	12: 16,
	13: 17,
};

Date.prototype.addHours = function (h) {
	this.setTime(this.getTime() + h * 60 * 60 * 1000);
	return this;
};

Date.prototype.lowerHours = function (h) {
	this.setTime(this.getTime() - h * 60 * 60 * 1000);
	return this;
};

export function checkProviderTime(bookings, providerId, startDate, endDate) {
	const providerBookings = bookings.filter(
		(booking) => booking.provider_id == providerId
	);

	let res = true;
	providerBookings.forEach((booking) => {
		const bookingStartDate = new Date(booking.start);
		const bookingEndDate = new Date(booking.end);
		const currentStartDate = new Date(startDate);
		const currentEndDate = new Date(endDate);

		if (
			currentStartDate.getTime() >= bookingStartDate.getTime() &&
			currentStartDate.getTime() < bookingEndDate.getTime()
		)
			res = false;
		if (
			currentEndDate.getTime() > bookingStartDate.getTime() &&
			currentEndDate.getTime() <= bookingEndDate.getTime()
		)
			res = false;
	});
	return res;
}

export function checkClientTime(bookings, startDate, endDate) {
	const clientBookings = bookings.filter((booking) => booking.title);

	console.clear();
	console.log(
		"bookings",
		bookings,
		bookings.map((booking) => toJS(booking))
	);

	let res = true;
	clientBookings.forEach((booking) => {
		const bookingStartDate = new Date(booking.start);
		const bookingEndDate = new Date(booking.end);
		const currentStartDate = new Date(startDate);
		const currentEndDate = new Date(endDate);

		// bookingStartDate.lowerHours(1);
		// bookingEndDate.lowerHours(1);

		// console.log("--------------");
		// console.log(currentStartDate);
		// console.log(currentEndDate);
		// console.log(bookingStartDate);
		// console.log(bookingEndDate);

		if (
			currentStartDate.getTime() >= bookingStartDate.getTime() &&
			currentStartDate.getTime() < bookingEndDate.getTime()
		)
			res = false;
		if (
			currentEndDate.getTime() > bookingStartDate.getTime() &&
			currentEndDate.getTime() <= bookingEndDate.getTime()
		)
			res = false;
	});
	return res;
}

export const selectTimes = [
	"07:00",
	"07:30",
	"08:00",
	"08:30",
	"09:00",
	"09:30",
	"10:00",
	"10:30",
	"11:00",
	"11:30",
	"12:00",
	"12:30",
	"13:00",
	"13:30",
	"14:00",
	"14:30",
	"15:00",
	"15:30",
	"16:00",
	"16:30",
	"17:00",
	"17:30",
	"18:00",
	"18:30",
	"19:00",
	"19:30",
	"20:00",
	"20:30",
	"21:00",
	"21:30",
	"22:00",
];

export const checkAvailableTime = (from, to, provider, bookings) => {
	console.log("check", from);
	let available = true;
	bookings.forEach((booking) => {
		if (
			booking.provider_id == provider &&
			((booking.start.getTime() <= from.getTime() &&
				booking.end.getTime() > from.getTime()) ||
				(booking.start.getTime() < to.getTime() &&
					booking.end.getTime() >= to.getTime()))
		)
			available = false;
	});
	return available;
};

function padZero(str, len) {
	len = len || 2;
	var zeros = new Array(len).join("0");
	return (zeros + str).slice(-len);
}

export function invertColor(hex, bw) {
	if (hex.indexOf("#") === 0) {
		hex = hex.slice(1);
	}
	// convert 3-digit hex to 6-digits.
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	// if (hex.length !== 6) {
	// 	throw new Error("Invalid HEX color.");
	// }
	var r = parseInt(hex.slice(0, 2), 16),
		g = parseInt(hex.slice(2, 4), 16),
		b = parseInt(hex.slice(4, 6), 16);
	if (bw) {
		// https://stackoverflow.com/a/3943023/112731
		return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
	}
	// invert color components
	r = (255 - r).toString(16);
	g = (255 - g).toString(16);
	b = (255 - b).toString(16);
	// pad each with zeros and return
	return "#" + padZero(r) + padZero(g) + padZero(b);
}
