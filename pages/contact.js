import React, { useEffect, useState } from "react";

import Head from "next/head";
import { withAuthSync } from "../utils/auth";
import fetch from "isomorphic-unfetch";
import nextCookie from "next-cookies";
import Router from "next/router";
import Layout from "../components/Layout";
import Link from "next/link";

const Contact = (props) => {
	const { token, id, adminId, name } = props;

	const [subject, setSubject] = useState();
	const [message, setMessage] = useState();
	const [state, setState] = useState(false);
	const [futures, setFutures] = useState();
	const [response, setResponse] = useState();

	useEffect(() => {
		const res = fetch(
			`https://mediabit.ro/booking-staging/wp-json/wp/v2/futures?per_page=100`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				redirect: "follow",
			}
		)
			.then((res) => res.json())
			.then((res) => {
				console.log("Futures", res);
				setFutures(res[0]);
			});
	}, []);

	const handleSubmit = (e) => {
		e.preventDefault();

		setState("loading");

		console.log("id", id);

		const formData = new FormData();
		formData.append("id", id);
		formData.append("message", message);
		formData.append("subject", subject);

		const res = fetch(
			`https://mediabit.ro/booking-staging/wp-json/v1/send-mail`,
			{
				method: "POST",
				// headers: {
				// 	"Content-Type": "application/json",
				// 	Authorization: `Bearer ${token}`,
				// },
				body: formData,
				redirect: "follow",
			}
		)
			.then((res) => res.json())
			.then((res) => {
				console.log("resssss", res);
				setState(false);
				setResponse("Mesajul a fost trimis cu succes");
			});
	};

	return (
		<Layout adminId={adminId} name={name}>
			<Head>
				<title>Psymep</title>
				<meta name='description' content='Psymep' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='p-4'>
				<div className='row'>
					<div className='col-lg-6'>
						<table className='table'>
							<tbody>
								<tr>
									<th>Contact</th>
									<td>Elena Ivan</td>
								</tr>
								<tr>
									<th>Telefon</th>
									<td>
										<a href='tel:0766472857'>0766472857</a>
									</td>
								</tr>
								<tr>
									<th>E-mail</th>
									<td>
										<a href='mailto:elenastela.ivan@gmail.com'>
											elenastela.ivan@gmail.com
										</a>
									</td>
								</tr>
								<tr>
									<th>Termeni</th>
									<td>
										<Link href='/termeni-si-conditii-2'>
											<a>
												<i className='bi bi-people-fill'></i>
												Termeni si conditii
											</a>
										</Link>
									</td>
								</tr>
							</tbody>
						</table>
						<div className='mt-4'>
							<h2>Contacteaza-ne</h2>
							<input
								type='text'
								placeholder='subiect'
								className='form-control mt-2'
								onInput={(e) => setSubject(e.target.value)}
							/>
							<textarea
								className='form-control mt-2'
								onChange={(e) => setMessage(e.target.value)}
								placeholder='Mesaj'></textarea>
							<button
								className='btn btn-primary btn-sm py-2 mt-2 w-100'
								disabled={state === "loading"}
								onClick={handleSubmit}>
								Trimite
								{state === "loading" && (
									<div
										className='spinner-border text-light spinner-border-sm'
										role='status'></div>
								)}
							</button>
							{response && (
								<div className='alert alert-success mt-2'>{response}</div>
							)}
							{state === "error" && (
								<div className='alert alert-danger mt-2'>
									Mesajul nu a putut fi trimis
								</div>
							)}
						</div>
						{futures && (
							<div className='mt-4'>
								<h2
									dangerouslySetInnerHTML={{
										__html: futures.title.rendered,
									}}></h2>
								<div
									dangerouslySetInnerHTML={{ __html: futures.content.rendered }}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</Layout>
	);
};

Contact.getInitialProps = (ctx) => {
	const { token, id, adminId, name } = nextCookie(ctx);

	if (!token || !id) Router.push("/login");

	return {
		token,
		id,
		adminId,
		name,
	};
};

export default withAuthSync(Contact);
