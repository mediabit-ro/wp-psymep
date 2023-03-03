import React, { useEffect, useState } from "react";
import { withAuthSync } from "../utils/auth";
import nextCookie from "next-cookies";
import Head from "next/head";
import fetch from "isomorphic-unfetch";
import store from "../store/store";
import { login } from "../utils/auth";

const TermeniSiConditii = () => {
	const user = store.terms.user;
	const users = store.terms.users;
	const content = store.terms.content;
	const [loading, setLoading] = useState(false);

	const submitHandler = () => {
		// Update post with new user
		setLoading(true);

		const usersMaped = users.map((item) => {
			return { user: item };
		});
		usersMaped.push({ user: user.id });

		console.log("USER", user.token);

		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${user.token}`);

		var requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow",
		};

		console.log(
			`https://mediabit.ro/booking/wp-json/v1/update-terms?user_id=${user.id}&post_id=${store.terms.postId}`
		);

		fetch(
			`https://mediabit.ro/booking/wp-json/v1/update-terms?user_id=${user.id}&post_id=${store.terms.postId}`,
			requestOptions
		)
			.then((res) => res.json())
			.then((res) => {
				console.log("res add terms", res);

				login({
					token: user.token,
					id: user.id,
					name: user.name,
					terms: res.data,
				});
			})
			.catch((error) => console.log("error", error));
	};
	return (
		<>
			<Head>
				<title>Psymep</title>
				<meta name='description' content='Psymep' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='bg-light'>
				<div className='container py-5'>
					<div dangerouslySetInnerHTML={{ __html: content }} />
					<div className='my-4 text-center'>
						<button
							disabled={loading}
							className='btn btn-primary'
							onClick={submitHandler}>
							Sunt de acord
							{loading && (
								<div
									className='spinner-border text-light spinner-border-sm'
									role='status'></div>
							)}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default TermeniSiConditii;
