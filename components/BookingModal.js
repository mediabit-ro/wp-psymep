import React from "react";
import { Modal } from "react-bootstrap";
import store from "../store/store";
import { formatDateHMS, formatDateYMD, formatDateReadableDM } from "./../utils";
import { toJS } from "mobx";
export default function BookingModal({
	data,
	showRez,
	setShowRez,
	token,
	events,
	setEvents,
}) {
	const cancelBookingHandler = () => {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);

		var requestOptions = {
			method: "DELETE",
			headers: myHeaders,
			redirect: "follow",
		};

		fetch(
			`https://mediabit.ro/booking/wp-json/wp/v2/posts/${data.id}`,
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
						<div className='text-end'>
							<button
								onClick={() => cancelBookingHandler()}
								className='btn btn-primary mt-3 px-5'>
								Anulează Rezervarea
							</button>
						</div>
					</Modal.Body>
				</Modal>
			)}
		</>
	);
}
