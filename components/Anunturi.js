import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { formatDateReadable } from "./../utils";

function updateExcludedPostsCookie(postIds) {
	// Define the cookie name
	const cookieName = "excludedPostIds";

	// Get the current cookie value, if it exists
	let excludedIds = getCookie(cookieName);

	// Parse the cookie string into an array if it exists, otherwise start with an empty array
	excludedIds = excludedIds ? excludedIds.split(",").map(Number) : [];

	// Add new IDs to the array (avoiding duplicates)
	postIds.forEach((id) => {
		if (!excludedIds.includes(id)) {
			excludedIds.push(id);
		}
	});

	// Update the cookie with the new list of excluded IDs
	document.cookie = `${cookieName}=${excludedIds.join(",")}; path=/; max-age=${
		60 * 60 * 24 * 365 * 10
	}`;
	// The cookie will expire in 7 days (max-age = 7 days in seconds)
}

// Helper function to get a cookie value by name
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(";").shift();
	return "";
}

export default function ModalAnt({ showAnt, setShowAnt }) {
	const [anunturi, setAnunturi] = useState([]);
	useEffect(() => {
		var requestOptions = {
			method: "GET",
			redirect: "follow",
		};

		// Exclude posts ids from cookies in "anunturi"
		const excludedIds = getCookie("excludedPostIds");

		const excludeUrl = "?exclude=" + excludedIds;

		fetch(
			process.env.NEXT_PUBLIC_URL + "/wp-json/wp/v2/anunturi" + excludeUrl,
			requestOptions
		)
			.then((response) => response.json())
			.then((response) => {
				if (response.length !== 0 && response.length !== undefined) {
					setAnunturi(response);
					setShowAnt(true);
					updateExcludedPostsCookie(response.map((post) => post.id));
				}
			})
			.catch((error) => {
				console.error(
					"You have an error in your code or there are Network issues.",
					error
				);
			});
	}, []);

	return (
		<>
			<Modal show={showAnt} onHide={() => setShowAnt(false)}>
				<Modal.Header closeButton></Modal.Header>
				<Modal.Body>
					{anunturi.map((anunt) => (
						<div key={anunt.id} className='border-bottom pb-2 mb-2'>
							<h5>{anunt.title.rendered}</h5>
							<div
								dangerouslySetInnerHTML={{
									__html: anunt.content.rendered,
								}}></div>
							<p className='small text-end'>{formatDateReadable(anunt.date)}</p>
						</div>
					))}
				</Modal.Body>
			</Modal>
		</>
	);
}
