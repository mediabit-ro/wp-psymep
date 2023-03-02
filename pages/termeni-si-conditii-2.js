import React, { useEffect, useState } from "react";

import Head from "next/head";
import { withAuthSync } from "../utils/auth";
import fetch from "isomorphic-unfetch";
import nextCookie from "next-cookies";
import Router from "next/router";
import Layout from "../components/Layout";
import Link from "next/link";
import { roTimezone } from "../utils";

const TermeniSiConditii2 = (props) => {
	const { token, id, adminId, name, terms } = props;
	const [content, setContent] = useState("");

	console.log("terms date", roTimezone(props.terms));

	useEffect(() => {
		var myHeaders = new Headers();
		myHeaders.append("Authorization", `Bearer ${token}`);

		var requestOptions = {
			method: "GET",
			headers: myHeaders,
			redirect: "follow",
		};
		fetch(
			"https://mediabit.ro/booking-staging/wp-json/wp/v2/termeni?per_page=1",
			requestOptions
		)
			.then((response) => response.json())
			.then((response) => {
				setContent(response[0].content.rendered);
			})
			.catch((error) => {
				console.error(
					"You have an error in your code or there are Network issues.",
					error
				);
			});
	}, []);

	return (
		<Layout adminId={adminId} name={name}>
			<Head>
				<title>Psymep</title>
				<meta name='description' content='Psymep' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='p-4'>
				<div dangerouslySetInnerHTML={{ __html: content }} />
				{content && (
					<div>
						Termeni acceptati in date de <strong>{props.terms}</strong>
					</div>
				)}
			</div>
		</Layout>
	);
};

TermeniSiConditii2.getInitialProps = (ctx) => {
	const { token, id, adminId, name, terms } = nextCookie(ctx);

	return {
		token,
		id,
		adminId,
		name,
		terms,
	};
};

export default withAuthSync(TermeniSiConditii2);
