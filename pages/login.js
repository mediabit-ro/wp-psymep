import Head from "next/head";
import fetch from "isomorphic-unfetch";
import React, { useState } from "react";
import { login } from "../utils/auth";
import Link from "next/link";
import Router from "next/router";
import store from "../store/store";
import cookie from "js-cookie";

export default function Login() {
	const [userData, setUserData] = useState({ username: "", error: "" });
	const [loading, setLoading] = useState();
	const [error, setError] = useState();

	console.log("URL", process.env.NEXT_PUBLIC_URL);

	async function handleSubmit(event) {
		setLoading(true);
		event.preventDefault();
		setUserData(Object.assign({}, userData, { error: "" }));

		const url = process.env.NEXT_PUBLIC_URL + "/wp-json/jwt-auth/v1/token";

		var formdata = new FormData();
		formdata.append("username", userData.username);
		formdata.append("password", userData.password);

		var requestOptions = {
			method: "POST",
			body: formdata,
			redirect: "follow",
		};
		fetch(
			process.env.NEXT_PUBLIC_URL + "/wp-json/jwt-auth/v1/token",
			requestOptions
		)
			.then((response) => response.json())
			.then((response) => {
				console.log("response token", response);
				const { token } = response;

				if (token) {
					var myHeaders = new Headers();
					myHeaders.append("Authorization", `Bearer ${token}`);

					var requestOptions = {
						method: "GET",
						headers: myHeaders,
						redirect: "follow",
					};

					console.log("headers", "Authorization", `Bearer ${token}`);

					fetch("/api/user", {
					headers: {
						token: token, // Or Authorization: `Bearer ${token}` if you prefer
					},
					})
					.then((res) => res.json())
					.then((data) => {
						const { id, name } = data;
						console.log("User:", id, name);

							// Get last custom post type "termeni"
							fetch(
								process.env.NEXT_PUBLIC_URL +
									"/wp-json/wp/v2/termeni?per_page=1",
								requestOptions
							)
								.then((response) => response.json())
								.then((response) => {
									console.log("response termeni", response);
									let users = [];
									if (response[0].acf.users) users = response[0].acf.users;
									// Get acf field users

									let user = users.find((item) => item.user === id);

									console.log("User", user);

									if (users && user) {
										// If user is in the list
										console.log("User in terms list. Proceed to login");
										login({ token, id, name, terms: user.data });
									} else {
										// If user is not in the list
										console.log("Push termeni");
										store.terms.content = response[0].content.rendered;
										store.terms.user = { token, id, name, data: new Date() };
										store.terms.postId = response[0].id;
										store.terms.users = users;

										Router.push("/termeni-si-conditii");
									}
								})
								.catch((error) => {
									console.error(
										"You have an error in your code or there are Network issues.",
										error
									);
								});

							// login({ token, id, name });
						})
						.catch((error) => {
							console.error(
								"You have an error in your code or there are Network issues.",
								error
							);
						});
				} else {
					setLoading(false);
					setError("Sometihng went wrong");
				}
			})
			.catch((error) => {
				console.log(
					"You have an error in your code or there are Network issues.",
					error
				);
				setLoading();
			});
	}
	return (
		<>
			<Head>
				<title>{process.env.NAME} | Login</title>
			</Head>
			<div className='bg-light'>
				<div className='container d-flex justify-content-center align-items-center vh-100'>
					<div
						className='p-5 mb-5 bg-white rounded-lg'
						style={{ maxWidth: "500px" }}>
						<div className='display-5 mb-3'>ACCOUNT LOGIN</div>
						<form onSubmit={handleSubmit}>
							<input
								className='form-control mb-2'
								type='text'
								placeholder='User'
								value={userData.username}
								onChange={(event) =>
									setUserData(
										Object.assign({}, userData, {
											username: event.target.value,
										})
									)
								}
							/>

							<input
								className='form-control mb-2'
								type='password'
								placeholder='Password'
								value={userData.password}
								onChange={(event) =>
									setUserData(
										Object.assign({}, userData, {
											password: event.target.value,
										})
									)
								}
							/>

							<button
								disabled={loading}
								className='btn btn-primary w-100 mt-2'
								type='submit'>
								Login
								{loading && (
									<div
										className='spinner-border text-light spinner-border-sm'
										role='status'></div>
								)}
							</button>

							{userData.error && (
								<div className='alert alert-danger mt-3' role='alert'>
									Error: {userData.error}
								</div>
							)}
							{error && (
								<div className='alert alert-danger mt-3' role='alert'>
									{error}
								</div>
							)}
						</form>
						<div className='text-center mt-2'>
							<div>sau</div>
							<Link href='/register'>
								<a>Creeaza un cont</a>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
