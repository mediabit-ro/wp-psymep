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

	const subjects = ["Subiect 1", "Subiect 2", "Subiect 3"];

	const handleSubmit = (e) => {
		e.preventDefault();

		setState("loading");

		const formData = new FormData();
		formData.append("your-name", name);
		formData.append("your-subject", subject);
		formData.append("your-message", message);

		const res = fetch(
			`https://mediabit.ro/booking-staging/contact-form-7/v1/contact-forms/38589/feedback`,
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
			.then((res) => console.log("resssss", res));
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
							<select
								className='form-control'
								onChange={(e) => setSubject(e.target.value)}>
								<option disabled value=''>
									Alege subiect
								</option>
								{subjects.map((subject) => (
									<option key={subject} value={subject}>
										{subject}
									</option>
								))}
							</select>
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
							{state === "error" && (
								<div className='alert alert-danger mt-2'>
									Mesajul nu a putut fi trimis
								</div>
							)}
						</div>
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
