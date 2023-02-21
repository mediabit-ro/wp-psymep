import React, { useEffect, useState } from "react";

import Head from "next/head";
import { withAuthSync } from "../utils/auth";
import fetch from "isomorphic-unfetch";
import nextCookie from "next-cookies";
import Router from "next/router";
import store from "../store/store";
import Image from "next/image";
import { toJS } from "mobx";
import { login } from "../utils/auth";

const TermeniSiConditii = () => {
	let user = store.terms.user;
	let content = store.terms.content;
	let users = store.terms.users;
	const submitHandler = () => {
		// Update post with new user

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
			"URL",
			`http://mediabit.ro/booking-staging/wp-json/v1/update-terms?user_id=${user.id}&post_id=${store.terms.postId}`
		);

		fetch(
			`http://mediabit.ro/booking-staging/wp-json/v1/update-terms?user_id=${user.id}&post_id=${store.terms.postId}`,
			requestOptions
		)
			.then((res) => login({ token: user.token, id: user.id, name: user.name }))
			.catch((error) => console.log("error", error));
	};
	return (
		<div className='bg-light'>
			<div className='container py-5'>
				<div dangerouslySetInnerHTML={{ __html: content }} />
				<div className='my-4 text-center'>
					<button className='btn btn-primary' onClick={submitHandler}>
						Sunt de acord
					</button>
				</div>
			</div>
		</div>
	);
};

export default TermeniSiConditii;
