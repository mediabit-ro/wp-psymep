import { useEffect } from "react";
import Router from "next/router";
import nextCookie from "next-cookies";
import cookie from "js-cookie";

export const login = ({ token, id, name }) => {
	const admins = [92, 2];

	if (admins.includes(id)) {
		cookie.set("adminId", id, { expires: 1 });
	} else {
		cookie.set("adminId", "", { expires: 1 });
	}

	cookie.set("token", token, { expires: 1 });
	cookie.set("id", id, { expires: 1 });
	cookie.set("name", name, { expires: 1 });
	Router.push("/calendar");
};

export const auth = (ctx) => {
	const { token, name, id, adminId } = nextCookie(ctx);

	// If there's no token, it means the user is not logged in.
	if (!token) {
		if (typeof window === "undefined") {
			ctx.res.writeHead(302, { Location: "/login" });
			ctx.res.end();
		} else {
			Router.push("/login");
		}
	}

	return { token, name, id, adminId };
};

export const logout = () => {
	cookie.remove("token");
	cookie.remove("id");
	cookie.remove("adminId");
	cookie.remove("name");
	// to support logging out from all windows
	window.localStorage.setItem("logout", Date.now());
	Router.push("/login");
};

export const withAuthSync = (WrappedComponent) => {
	const Wrapper = (props) => {
		const syncLogout = (event) => {
			if (event.key === "logout") {
				console.log("logged out from storage!");
				Router.push("/login");
			}
		};

		useEffect(() => {
			window.addEventListener("storage", syncLogout);

			return () => {
				window.removeEventListener("storage", syncLogout);
				window.localStorage.removeItem("logout");
			};
		}, []);

		return <WrappedComponent {...props} />;
	};

	Wrapper.getInitialProps = async (ctx) => {
		const { token, name, id, adminId } = auth(ctx);

		const componentProps =
			WrappedComponent.getInitialProps &&
			(await WrappedComponent.getInitialProps(ctx));

		return { ...componentProps, token, name, id, adminId };
	};

	return Wrapper;
};
