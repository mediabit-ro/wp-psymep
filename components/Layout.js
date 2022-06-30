import React, { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { logout } from "../utils/auth";
import store from "../store/store";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";

const Layout = observer(({ children }) => {
	const router = useRouter();
	const currentRoute = router.pathname;
	const [dropdownState, setDropdownState] = useState(false);
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);

	return (
		<div>
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
					<div className='navbar-item'>
						<Link href='/'>
							<a className={currentRoute === "/" ? "active" : ""}>
								<i className='bi bi-columns-gap'></i>
								Locatii
							</a>
						</Link>
					</div>
					<div className='navbar-item'>
						<Link href='/calendar'>
							<a className={currentRoute === "/calendar" ? "active" : ""}>
								<i className='bi bi-calendar-event'></i>
								Calendar
							</a>
						</Link>
					</div>
					<div className='dropdown-head-wrap'>
						<div
							className='dropdown-head'
							onClick={() => setDropdownState(!dropdownState)}>
							Camere
							{dropdownState ? (
								<i className='bi bi-caret-up'></i>
							) : (
								<i className='bi bi-caret-down'></i>
							)}
						</div>
						{dropdownState && (
							<div className='dropdown-body'>
								{store.providers.map((provider) => (
									<div key={"sbapkeym" + provider.id} className='form-check'>
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
												(activeProvider) => activeProvider.id === provider.id
											)}
											id={"sbap" + provider.id}
										/>
										<label className='form-check-label'>{provider.name}</label>
									</div>
								))}
							</div>
						)}
					</div>

					<div className='navbar-item'>
						<Link href='/lista-rezervari'>
							<a
								className={currentRoute === "/lista-rezervari" ? "active" : ""}>
								<i className='bi bi-list-ul'></i>
								Listă Rezervări
							</a>
						</Link>
					</div>
					<div className='navbar-item'>
						<Link
							className={currentRoute === "/contact" ? "active" : ""}
							href='/contact'>
							<a>
								<i className='bi bi-person-lines-fill'></i>
								Contact
							</a>
						</Link>
					</div>
					<div className='navbar-item'>
						<button onClick={logout} className='btn btn-link'>
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
				<i
					onClick={handleShow}
					className='bi bi-list cursor-pointer d-lg-none h2 mb-0'></i>
				<div className='profile fw-bold d-none d-lg-block'></div>
			</div>
			<div className='main-wrap'>
				<div className='navbar-main d-none d-lg-block'>
					<div className='navbar-item'>
						<Link href='/'>
							<a className={currentRoute === "/" ? "active" : ""}>
								<i className='bi bi-columns-gap'></i>
								Locatii
							</a>
						</Link>
					</div>
					<div className='navbar-item'>
						<Link href='/calendar'>
							<a className={currentRoute === "/calendar" ? "active" : ""}>
								<i className='bi bi-calendar-event'></i>
								Calendar
							</a>
						</Link>
					</div>
					<div className='dropdown-head-wrap'>
						<div
							className='dropdown-head'
							onClick={() => setDropdownState(!dropdownState)}>
							Camere
							{dropdownState ? (
								<i className='bi bi-caret-up'></i>
							) : (
								<i className='bi bi-caret-down'></i>
							)}
						</div>
						{dropdownState && (
							<div className='dropdown-body'>
								{store.providers.map((provider) => (
									<div key={"sbapkey" + provider.id} className='form-check'>
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
												(activeProvider) => activeProvider.id === provider.id
											)}
											id={"sbap" + provider.id}
										/>
										<label className='form-check-label'>{provider.name}</label>
									</div>
								))}
							</div>
						)}
					</div>

					<div className='navbar-item'>
						<Link href='/lista-rezervari'>
							<a
								className={currentRoute === "/lista-rezervari" ? "active" : ""}>
								<i className='bi bi-list-ul'></i>
								Listă Rezervări
							</a>
						</Link>
					</div>
					<div className='navbar-item'>
						<Link href='/contact'>
							<a className={currentRoute === "/contact" ? "active" : ""}>
								<i className='bi bi-person-lines-fill'></i>
								Contact
							</a>
						</Link>
					</div>
					<div className='navbar-item'>
						<button onClick={logout} className='btn btn-link'>
							<i className='bi bi-box-arrow-right'></i>
							Deconectare
						</button>
					</div>
				</div>
				<div className='main'>{children}</div>
			</div>
		</div>
	);
});

export default Layout;
