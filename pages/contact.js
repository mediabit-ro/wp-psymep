import React, { useEffect, useState } from "react";

import Head from "next/head";
import { withAuthSync } from "../utils/auth";
import fetch from "isomorphic-unfetch";
import nextCookie from "next-cookies";
import Router from "next/router";
import Layout from "../components/Layout";

const Contact = (props) => {
	const { token, id, adminId, name } = props;

	return (
		<Layout adminId={adminId} name={name}>
			<Head>
				<title>Psymep</title>
				<meta name='description' content='Psymep' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='p-4'>
				<div className='mb-2'>
					<strong>Contact:</strong> Elena Ivan
				</div>
				<div className='mb-2'>
					<strong>Telefon:</strong> <a href='tel:0766472857'>0766472857</a>
				</div>
				<div className='mb-2'>
					<strong>E-mail:</strong>{" "}
					<a href='mailto:elenastela.ivan@gmail.com'>
						elenastela.ivan@gmail.com
					</a>
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
