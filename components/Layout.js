import React, { useEffect, useState } from "react";
import { Offcanvas } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { logout } from "../utils/auth";
import store from "../store/store";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import Head from "next/head";

const Layout = observer(({ children, adminId, name, page, token }) => {
	const router = useRouter();
	const currentRoute = router.pathname;
	const [dropdownState, setDropdownState] = useState(false);
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<div>
			<Head>
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' />
				<link
					href='https://fonts.googleapis.com/css2?family=Poppins&display=swap'
					rel='stylesheet'
				/>
			</Head>
			<Offcanvas show={show} onHide={handleClose}>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>
						<Image
							src='/psymep.png'
							width='160'
							height='32'
							className='img-fluid'
						/>
					</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body>
					<div
						className={
							"navbar-item navbar-contact " +
							(store.activeProviders.length !== 0 ? "animate-button" : "")
						}>
						<Link href='/calendar'>
							<a
								onClick={handleClose}
								className={currentRoute === "/calendar" ? "active" : ""}>
								<i className='bi bi-calendar-event'></i>
								Calendar
							</a>
						</Link>
					</div>

					<div
						style={{ margin: "0 0 0 15px" }}
						key={Math.random()}
						className='form-check d-inline-block'>
						<input
							className='form-check-input'
							type='checkbox'
							value=''
							style={{
								backgroundColor: "black",
								borderColor: "black",
							}}
							onChange={() => store.toggleMyBookings()}
							checked={store.myBookings}
							id='mbapmybookings'
						/>
						<label htmlFor={"mbapmybookings"} className='form-check-label'>
							Programarile mele
						</label>
					</div>

					<div className='navbar-item'>
						<Link href='/'>
							<a className={currentRoute === "/" ? "active" : ""}>
								<i className='bi bi-columns-gap'></i>
								Locații
							</a>
						</Link>
					</div>

					<div style={{ margin: "-15px 0 0 15px" }}>
						{store.locations
							.filter((location) =>
								store.providers.find(
									(provider) => provider.parent === location.id
								)
							)
							.map((location) => (
								<div key={Math.random()} className='mb-2'>
									<div>{location.name}</div>
									{store.providers
										.filter((provider) => provider.parent === location.id)
										.map((provider) => (
											<div key={Math.random()} className='form-check'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													style={{
														backgroundColor: provider.acf.culoare,
														borderColor: provider.acf.culoare,
													}}
													onChange={() => store.toggleProvider(provider)}
													checked={store.activeProviders.find(
														(activeProvider) =>
															activeProvider.id === provider.id
													)}
													id={"sbap" + provider.id}
												/>
												<label
													htmlFor={"sbap" + provider.id}
													className='form-check-label'>
													{provider.name}
												</label>
											</div>
										))}
								</div>
							))}
					</div>

					<div className='navbar-item'>
						<a href='/lista-rezervari'>
							<i className='bi bi-list-ul'></i>
							Listă Rezervări
						</a>
					</div>

					<div className='navbar-item'>
						<a rel='noreferrer' href='tel:0766472857' target='_blank'>
							<i className='bi bi-person-lines-fill'></i>
							Contact
						</a>
					</div>
					<div className='navbar-item'>
						<Link href='/rapoarte'>
							<a className={currentRoute === "/rapoarte" ? "active" : ""}>
								<i className='bi bi-archive'></i>
								Rapoarte
							</a>
						</Link>
					</div>
					{adminId && (
						<div className='navbar-item'>
							<Link href='/accounts'>
								<a className={currentRoute === "/accounts" ? "active" : ""}>
									<i className='bi bi-people-fill'></i>
									Accounts
								</a>
							</Link>
						</div>
					)}
					{adminId && (
						<div className='navbar-item'>
							<Link href={`https://psymep.mediabit.ro/login?token=${token}`}>
								<a>
									<i className='bi bi-receipt-cutoff'></i>
									Facturare
								</a>
							</Link>
						</div>
					)}
					<div className='navbar-item'>
						<button onClick={logout} className='btn btn-link p-0 ps-2'>
							<i className='bi bi-box-arrow-right'></i>
							Deconectare
						</button>
					</div>
				</Offcanvas.Body>
			</Offcanvas>
			<div className='d-flex justify-content-between py-3 px-4'>
				<div className='logo mx-auto mx-lg-0'>
					<Image
						src='/psymep.png'
						width='160'
						height='32'
						className='img-fluid'
					/>
				</div>
				<div className='ms-auto'>
					<div className='small rounded bg-light p-1'>{name}</div>
				</div>
				<i
					onClick={handleShow}
					className='bi bi-list cursor-pointer d-lg-none h2 mb-0'></i>
				<div className='profile fw-bold d-none d-lg-block'></div>
			</div>
			<div className='main-wrap'>
				<div className='navbar-main d-none d-lg-block'>
					<div
						className={
							"navbar-item navbar-contact " +
							(store.activeProviders.length !== 0 ? "animate-button" : "")
						}>
						<Link href='/calendar'>
							<a className={currentRoute === "/calendar" ? "active" : ""}>
								<i className='bi bi-calendar-event'></i>
								Calendar
							</a>
						</Link>
					</div>

					<div
						style={{ margin: "0 0 0 15px" }}
						key={Math.random()}
						className='form-check d-inline-block'>
						<input
							className='form-check-input'
							type='checkbox'
							value=''
							style={{
								backgroundColor: "black",
								borderColor: "black",
							}}
							onChange={() => store.toggleMyBookings()}
							checked={store.myBookings}
							id='sbapmybookings'
						/>
						<label htmlFor={"sbapmybookings"} className='form-check-label'>
							Programarile mele
						</label>
					</div>

					<div className='navbar-item'>
						<Link href='/'>
							<a className={currentRoute === "/" ? "active" : ""}>
								<i className='bi bi-columns-gap'></i>
								Locații
							</a>
						</Link>
					</div>

					<div style={{ margin: "-15px 0 0 15px" }}>
						{/* <div key={Math.random()} className='form-check'>
							<input
								className='form-check-input'
								type='checkbox'
								value=''
								style={{
									backgroundColor: "black",
									borderColor: "black",
								}}
								onChange={() => store.toggleMyBookings()}
								checked={store.myBookings}
								id='mbapmybookings'
							/>
							<label htmlFor={"mbapmybookings"} className='form-check-label'>
								Programarile mele
							</label>
						</div> */}
						{store.locations
							.filter((location) =>
								store.providers.find(
									(provider) => provider.parent === location.id
								)
							)
							.map((location) => (
								<div key={Math.random()} className='mb-2'>
									<div>{location.name}</div>
									{store.providers
										.filter((provider) => provider.parent === location.id)
										.map((provider) => (
											<div key={Math.random()} className='form-check'>
												<input
													className='form-check-input'
													type='checkbox'
													value=''
													style={{
														backgroundColor: provider.acf.culoare,
														borderColor: provider.acf.culoare,
													}}
													onChange={() => store.toggleProvider(provider)}
													checked={store.activeProviders.find(
														(activeProvider) =>
															activeProvider.id === provider.id
													)}
													id={"sbapd" + provider.id}
												/>
												<label
													htmlFor={"sbapd" + provider.id}
													className='form-check-label'>
													{provider.name}
												</label>
											</div>
										))}
								</div>
							))}
					</div>

					<div className='navbar-item'>
						<a href='/lista-rezervari'>
							<i className='bi bi-list-ul'></i>
							Listă Rezervări
						</a>
					</div>

					<div className='navbar-item'>
						<Link href='/contact'>
							<a className={currentRoute === "/contact" ? "active" : ""}>
								<i className='bi bi-list-ul'></i>
								Contact
							</a>
						</Link>
					</div>
					<div className='navbar-item'>
						<Link href='/rapoarte'>
							<a className={currentRoute === "/rapoarte" ? "active" : ""}>
								<i className='bi bi-archive'></i>
								Rapoarte
							</a>
						</Link>
					</div>
					{adminId && (
						<div className='navbar-item'>
							<Link href='/accounts'>
								<a className={currentRoute === "/accounts" ? "active" : ""}>
									<i className='bi bi-people-fill'></i>
									Accounts
								</a>
							</Link>
						</div>
					)}
					{adminId && (
						<div className='navbar-item'>
							<Link href={`https://psymep.mediabit.ro/login?token=${token}`}>
								<a>
									<i className='bi bi-receipt-cutoff'></i>
									Facturare
								</a>
							</Link>
						</div>
					)}
					<div className='navbar-item'>
						<button onClick={logout} className='btn btn-link p-0 ps-2'>
							<i className='bi bi-box-arrow-right'></i>
							Deconectare
						</button>
					</div>
				</div>
				<div className={"main" + (page === "calendar" ? " calendar" : "")}>
					{children}
				</div>
			</div>
		</div>
	);
});

export default Layout;
