import Head from "next/head";
import fetch from "isomorphic-unfetch";
import React, { useState } from "react";
import { login } from "../utils/auth";
import Link from "next/link";

function ValidateEmail(mail) {
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
		return true;
	}
	return false;
}

export default function Login() {
	const [email, setEmail] = useState("");
	const [password1, setPassword1] = useState("");
	const [password2, setPassword2] = useState("");
	const [loading1, setLoading1] = useState(false);
	const [loading2, setLoading2] = useState(false);
	const [error1, setError1] = useState(false);
	const [error2, setError2] = useState(false);
	const [error3, setError3] = useState(false);
	const [step2, setStep2] = useState(false);
	const [step3, setStep3] = useState(false);
	const checkEmailHandler = () => {
		if (!ValidateEmail(email)) {
			setError1("Emailul nu este valid");
		} else {
			setLoading1(true);

			var requestOptions = {
				method: "GET",
				redirect: "follow",
			};

			fetch(
				`https://mediabit.ro/booking/wp-json/newpass/user/?email=${email}`,
				requestOptions
			)
				.then((response) => response.json())
				.then((result) => {
					if (result.code === "no_user") {
						setError1(result.message);
					} else if (result.code == "user_ok") {
						setStep2(true);
						setError1("");
					}
					console.log("result", result);
					setLoading1(false);
				})
				.catch((error) => {
					setError1(error.message);
					setLoading1(false);
				});
		}
	};

	const createAccountHandler = () => {
		console.log(password1.length);
		if (password1.length < 7) {
			setError2("Parola trebuie sa aiba minim 6 caractere");
		} else if (password1 !== password2) {
			setError2("");
			setError3("Parolele nu coincid");
		} else {
			setLoading2(true);

			var requestOptions = {
				method: "GET",
				redirect: "follow",
			};

			fetch(
				`https://mediabit.ro/booking/wp-json/newpass/user/?email=${email}&pass=${password1}`,
				requestOptions
			)
				.then((response) => response.json())
				.then((result) => {
					console.log("result", result);
					if (result.code === "pass_ok") {
						setStep2(false);
						setStep3(true);
					} else if (result.code === "invalid_password") {
						setError2(result.message);
					}
					setLoading2(false);
				})
				.catch((error) => {
					setError2(error.message);
					setLoading2(false);
				});
		}
	};

	return (
		<>
			<Head>
				<title>{process.env.NAME} | Login</title>
			</Head>
			<div className='bg-light'>
				<div className='container d-flex justify-content-center align-items-center vh-100'>
					<div
						className='p-5 mb-5 bg-white rounded-lg'
						style={{ maxWidth: "100%", width: "500px" }}>
						<div className='h3 mb-3'>
							{!step3 && !step2 && "Creeaza cont nou"}
							{step2 && "Seteaza o parola"}
							{step3 && "Contul a fost creat"}
						</div>
						{!step3 && (
							<div className='form-group'>
								<label>Email</label>
								<input
									value={email}
									onInput={(e) => setEmail(e.target.value)}
									disabled={step2}
									className='form-control'
									type='text'
									placeholder='User'
								/>
								<small className='form-text text-danger'>{error1}</small>
							</div>
						)}
						{!step2 && !step3 && (
							<button
								// disabled={loading}
								className='btn btn-primary w-100 mt-2'
								onClick={checkEmailHandler}
								disabled={loading1}
								type='submit'>
								Trimite email
								{loading1 && (
									<div
										className='spinner-border text-light spinner-border-sm'
										role='status'></div>
								)}
							</button>
						)}
						{step2 && (
							<>
								<div className='form-group'>
									<label>Password</label>
									<input
										className='form-control'
										type='password'
										onInput={(e) => setPassword1(e.target.value)}
										placeholder='***'
									/>
									<small className='form-text text-danger'>{error2}</small>
								</div>
								<div className='form-group'>
									<label>Confirm password</label>
									<input
										className='form-control'
										type='password'
										onInput={(e) => setPassword2(e.target.value)}
										placeholder='***'
									/>
									<small className='form-text text-danger'>{error3}</small>
								</div>
								<button
									// disabled={loading}
									className='btn btn-primary w-100 mt-2'
									onClick={createAccountHandler}
									disabled={loading2}
									type='submit'>
									Creeaza cont
									{loading2 && (
										<div
											className='spinner-border text-light spinner-border-sm'
											role='status'></div>
									)}
								</button>
							</>
						)}
						{step3 && (
							<div>
								<Link href='/login'>
									<a className='btn btn-primary px-5'>Autentifica-te</a>
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
