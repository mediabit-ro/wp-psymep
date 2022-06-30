export default function MobileHours() {
	const hours = [
		"8:00",
		"9:00",
		"10:00",
		"11:00",
		"12:00",
		"13:00",
		"14:00",
		"15:00",
		"16:00",
		"17:00",
		"18:00",
		"19:00",
		"20:00",
		"21:00",
		"22:00",
	];

	return (
		<div className='mobile-hours d-lg-none'>
			<div className='rbc-calendar'>
				{hours.map((item) => (
					<div key={Math.random()} className='rbc-time-gutter rbc-time-column'>
						<div className='rbc-timeslot-group'>
							<div className='position-relative 1'>
								<div className='date-in-file'>
									<div className='rbc-time-slot date-in-function'>
										<span className='rbc-label'>{item}</span>
									</div>
								</div>
							</div>
							<div className='position-relative 1'>
								<div className='date-in-file'>
									<div className='rbc-time-slot date-in-function'></div>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
