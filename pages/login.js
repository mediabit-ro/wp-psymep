import Head from "next/head";
import Router from "next/router";
import fetch from "isomorphic-unfetch";
import React, { useState } from "react";
import { login } from "../utils/auth";
import Link from "next/link";

export default function Login() {
	const [userData, setUserData] = useState({ username: "", error: "" });
	const [loading, setLoading] = useState();

	async function handleSubmit(event) {
		setLoading(true);
		event.preventDefault();
		setUserData(Object.assign({}, userData, { error: "" }));

		const url = "https://mediabit.ro/booking/wp-json/jwt-auth/v1/token";

		var formdata = new FormData();
		formdata.append("username", userData.username);
		formdata.append("password", userData.password);

		var requestOptions = {
			method: "POST",
			body: formdata,
			redirect: "follow",
		};

		fetch(
			"https://mediabit.ro/booking/wp-json/jwt-auth/v1/token",
			requestOptions
		)
			.then((response) => response.json())
			.then((response) => {
				console.log("response", response);
				const { token } = response;

				var myHeaders = new Headers();
				myHeaders.append("Authorization", `Bearer ${token}`);

				var requestOptions = {
					method: "GET",
					headers: myHeaders,
					redirect: "follow",
				};

				fetch(
					"https://mediabit.ro/booking/wp-json/wp/v2/users/me",
					requestOptions
				)
					.then((response) => response.json())
					.then((response) => {
						console.log("response inner", response);
						const { id } = response;

						console.log("test", token, id);

						login({ token, id });
					})
					.catch((error) => {
						console.error(
							"You have an error in your code or there are Network issues.",
							error
						);
					});
			})
			.catch((error) => {
				console.error(
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
								<p className='error'>Error: {userData.error}</p>
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
