import { dateFnsLocalizer } from "react-big-calendar";
import store from "../store/store";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
const Provider = observer(({ data }) => {
	console.log("Provider", toJS(store.activeProviders));

	return (
		<div
			onClick={() => store.toggleProvider(data)}
			className={
				"provider-item " +
				(store.activeProviders.find((provider) => provider.id === data.id)
					? "provider-active"
					: "")
			}>
			<div
				className='provider-image'
				style={{
					background: `#fff url(${data.acf.imagini}) no-repeat center`,
					backgroundSize: "cover",
				}}></div>
			<div className='provider-overlay'>
				<p className='mb-0'>{data.name}</p>
				<i className='bi bi-check-circle-fill'></i>
			</div>
		</div>
	);
});

export default Provider;
