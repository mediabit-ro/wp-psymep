import React, { useState, useEffect } from "react";
// import store from "../../../store";
// import { toJS } from "mobx";
// import { SortRounded } from "@mui/icons-material";

// function checkTimes(value, times) {}

// function formatDateYMD(date) {
// 	var d = new Date(date),
// 		month = "" + (d.getMonth() + 1),
// 		day = "" + d.getDate(),
// 		year = d.getFullYear();

// 	if (month.length < 2) month = "0" + month;
// 	if (day.length < 2) day = "0" + day;

// 	return [year, month, day].join("-");
// }

// function formatDateHMS(date) {
// 	var d = new Date(date),
// 		hours = "" + d.getHours(),
// 		minutes = "" + d.getMinutes(),
// 		seconds = "" + d.getSeconds();

// 	if (hours.length < 2) hours = "0" + hours;
// 	if (minutes.length < 2) minutes = "0" + minutes;
// 	if (seconds.length < 2) seconds = "0" + seconds;

// 	return [hours, minutes, seconds].join(":");
// }

export default function DateCell({ range, value, children }) {
	// const day = formatDateYMD(value);
	// const time = formatDateHMS(value);

	// const [providerState, setProviderState] = useState(false);

	const now = new Date();

	// useEffect(() => {
	// 	toJS(store.activeProviders).forEach((provider, index) => {
	// 		if (provider.times) {
	// 			const [times] = Object.values(provider.times[day]);
	// 			if (day === "2022-04-11") console.log(time, times);
	// 			if (times.length)
	// 				times.forEach((range) => {
	// 					if (time >= range.from && time < range.to) {
	// 						console.log("-----------", time);
	// 						setProviderState(true);
	// 					}
	// 				});
	// 		}
	// 	});
	// }, []);

	// console.log("value", value, now, value < now);
	return (
		<div className='position-relative 1'>
			<div className={value < now ? "date-in-file" : ""}>
				{/* {!providerState && (
					<div
						className='not-avb not-avb-1'
						style={{ background: "red" }}></div>
				)} */}
				{/* {value > now && provider[1] && (
				<div
					className='not-avb not-avb-1'
					style={{ background: "rgba(0,250,0, 0.1)" }}></div>
			)} */}
				{/* {value > now && provider[2] && (
				<div
					className='not-avb not-avb-1'
					style={{ background: "rgba(250,0,0, 0.1)" }}></div>
			)} */}
				{children}
			</div>
		</div>
	);
}
