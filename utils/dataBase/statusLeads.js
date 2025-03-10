import Leads from "../../models/leads.js";

export const statusLeads = async () => {
	
	const currentDate = new Date(new Date().toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires"
    }));
    
    const currentDateFormatted = new Date(currentDate).toLocaleString("es-AR", {
		timeZone: "America/Argentina/Buenos_Aires",
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false
	}).replace(/(\d+)\/(\d+)\/(\d+),/, "$3-$2-$1,");
	
	const fourWeeksAgo = new Date(currentDate);
	fourWeeksAgo.setDate(currentDate.getDate() - 28);
	const sevenDaysAgo = new Date(currentDate);
	sevenDaysAgo.setDate(currentDate.getDate() - 7);

	// 1. Cantidad de registros donde client_status es distinto a "compró" y "no compró"
	const totalRecords = await Leads.countDocuments({
		"flows.client_status": { $nin: ["compró", "no compró"] },
		"flows.model": { $exists: true },
	});

	// 2. Cantidad de registros con vendedor asignado y sin vendedor
	const withVendor = await Leads.countDocuments({
		"flows.client_status": { $nin: ["compró", "no compró"] },
		"flows.vendor_name": { $exists: true, $ne: null },
	});

	const withoutVendor = totalRecords - withVendor;

	// 3. Totales de las últimas 4 semanas
	let weeks = [
		{ semana1: { total: 0, compradores: 0 } },
		{ semana2: { total: 0, compradores: 0 } },
		{ semana3: { total: 0, compradores: 0 } },
		{ semana4: { total: 0, compradores: 0 } },
	];

	const weeklyData = await Leads.aggregate([
		{
			$unwind: "$flows",
		},
		{
			$addFields: {
				cleanFlowDate: {
					$concat: [
						{ $substr: ["$flows.flowDate", 0, 10] },
						", ",
						{ $substr: ["$flows.flowDate", 12, 2] },
						":",
						{ $substr: ["$flows.flowDate", 15, 2] },
						":",
						{ $substr: ["$flows.flowDate", 18, 2] },
					],
				},
				cleanStatusDate: {
					$concat: [
						{ $substr: ["$flows.statusDate", 0, 10] },
						", ",
						{ $substr: ["$flows.statusDate", 12, 2] },
						":",
						{ $substr: ["$flows.statusDate", 15, 2] },
						":",
						{ $substr: ["$flows.statusDate", 18, 2] },
					],
				},
			},
		},
		{
			$addFields: {
				"flows.flowDate": {
					$dateFromString: {
						dateString: "$cleanFlowDate",
						format: "%d/%m/%Y, %H:%M:%S",
					},
				},
				"flows.statusDate": {
					$dateFromString: {
						dateString: "$cleanStatusDate",
						format: "%d/%m/%Y, %H:%M:%S",
					},
				},
			},
		},
		{
			$match: {
				$or: [
					{ "flows.flowDate": { $gte: fourWeeksAgo } },
					{
						$and: [
							{ "flows.statusDate": { $gte: fourWeeksAgo } },
							{ "flows.client_status": "compró" },
						],
					},
				],
			},
		},
		{
			$facet: {
				totals: [
					{
						$match: {
							"flows.flowDate": { $gte: fourWeeksAgo },
						},
					},
					{
						$group: {
							_id: {
								week: {
									$floor: {
										$divide: [
											{ $subtract: [currentDate, "$flows.flowDate"] },
											1000 * 60 * 60 * 24 * 7,
										],
									},
								},
							},
							totalCount: { $sum: 1 },
						},
					},
				],
				purchases: [
					{
						$match: {
							"flows.client_status": "compró",
							"flows.statusDate": { $gte: fourWeeksAgo },
						},
					},
					{
						$group: {
							_id: {
								week: {
									$floor: {
										$divide: [
											{ $subtract: [currentDate, "$flows.statusDate"] },
											1000 * 60 * 60 * 24 * 7,
										],
									},
								},
							},
							purchasedCount: { $sum: 1 },
						},
					},
				],
			},
		},
	]);

	// Procesar los resultados semanales
	const processedWeeklyData = Array(4)
		.fill()
		.map((_, i) => ({
			[`semana${i + 1}`]: { total: 0, compradores: 0 },
		}));

	weeklyData[0].totals.forEach((total) => {
		const weekIndex = total._id.week;
		if (weekIndex >= 0 && weekIndex < 4) {
			processedWeeklyData[weekIndex][`semana${weekIndex + 1}`].total =
				total.totalCount;
		}
	});

	weeklyData[0].purchases.forEach((purchase) => {
		const weekIndex = purchase._id.week;
		if (weekIndex >= 0 && weekIndex < 4) {
			processedWeeklyData[weekIndex][`semana${weekIndex + 1}`].compradores =
				purchase.purchasedCount;
		}
	});

	weeks = processedWeeklyData;

	// 4. Totales de los últimos 7 días
	let days = [
		{ dia1: { total: 0, compradores: 0 } },
		{ dia2: { total: 0, compradores: 0 } },
		{ dia3: { total: 0, compradores: 0 } },
		{ dia4: { total: 0, compradores: 0 } },
		{ dia5: { total: 0, compradores: 0 } },
		{ dia6: { total: 0, compradores: 0 } },
		{ dia7: { total: 0, compradores: 0 } },
	];

	const dailyData = await Leads.aggregate([
		{
			$unwind: "$flows",
		},
		{
			$addFields: {
				cleanFlowDate: {
					$concat: [
						{ $substr: ["$flows.flowDate", 0, 10] },
						", ",
						{ $substr: ["$flows.flowDate", 12, 2] },
						":",
						{ $substr: ["$flows.flowDate", 15, 2] },
						":",
						{ $substr: ["$flows.flowDate", 18, 2] },
					],
				},
				cleanStatusDate: {
					$concat: [
						{ $substr: ["$flows.statusDate", 0, 10] },
						", ",
						{ $substr: ["$flows.statusDate", 12, 2] },
						":",
						{ $substr: ["$flows.statusDate", 15, 2] },
						":",
						{ $substr: ["$flows.statusDate", 18, 2] },
					],
				},
			},
		},
		{
			$addFields: {
				"flows.flowDate": {
					$dateFromString: {
						dateString: "$cleanFlowDate",
						format: "%d/%m/%Y, %H:%M:%S",
					},
				},
				"flows.statusDate": {
					$dateFromString: {
						dateString: "$cleanStatusDate",
						format: "%d/%m/%Y, %H:%M:%S",
					},
				},
			},
		},
		{
			$match: {
				$or: [
					{ "flows.flowDate": { $gte: sevenDaysAgo } },
					{
						$and: [
							{ "flows.statusDate": { $gte: sevenDaysAgo } },
							{ "flows.client_status": "compró" },
						],
					},
				],
			},
		},
		{
			$facet: {
				totals: [
					{
						$match: {
							"flows.flowDate": { $gte: sevenDaysAgo },
						},
					},
					{
						$group: {
							_id: {
								daysAgo: {
									$subtract: [
										{
											$trunc: {
												$divide: [
													{ $subtract: [currentDate, "$flows.flowDate"] },
													1000 * 60 * 60 * 24,
												],
											},
										},
										0,
									],
								},
							},
							totalCount: { $sum: 1 },
						},
					},
				],
				purchases: [
					{
						$match: {
							"flows.client_status": "compró",
							"flows.statusDate": { $gte: sevenDaysAgo },
						},
					},
					{
						$group: {
							_id: {
								daysAgo: {
									$subtract: [
										{
											$trunc: {
												$divide: [
													{ $subtract: [currentDate, "$flows.statusDate"] },
													1000 * 60 * 60 * 24,
												],
											},
										},
										0,
									],
								},
							},
							purchasedCount: { $sum: 1 },
						},
					},
				],
			},
		},
	]);

	// Procesar los resultados diarios
	const processedDailyData = Array(7)
		.fill()
		.map((_, i) => ({
			[`dia${i + 1}`]: { total: 0, compradores: 0 },
		}));

	dailyData[0].totals.forEach((total) => {
		if (total._id.daysAgo >= 0 && total._id.daysAgo < 7) {
			processedDailyData[total._id.daysAgo][
				`dia${total._id.daysAgo + 1}`
			].total = total.totalCount;
		}
	});

	dailyData[0].purchases.forEach((purchase) => {
		if (purchase._id.daysAgo >= 0 && purchase._id.daysAgo < 7) {
			processedDailyData[purchase._id.daysAgo][
				`dia${purchase._id.daysAgo + 1}`
			].compradores = purchase.purchasedCount;
		}
	});

	days = processedDailyData;

	const object = {
		leadsActivos: totalRecords,
		leadsConVendedor: withVendor,
		leadsSinVendedor: withoutVendor,
		semanalUltimas4Semanas: weeks,
		diarioUltimos7Dias: days,
	};

	const status = `*🔔 Leads al ${currentDateFormatted}:*\n\n- Leads: ${totalRecords}\n- Con vendedor: ${withVendor} (${(
		(withVendor / totalRecords) *
		100
	).toFixed(2)}%)\n- Sin vendedor: ${withoutVendor} (${(
		(withoutVendor / totalRecords) *
		100
	).toFixed(2)}%)\n\n*leads últimos 7 días:*\n${days
		.map((day, index) => {
			const dayKey = `dia${index + 1}`;
			return `D${index + 1}: ${day[dayKey].total} - Compradores: ${
				day[dayKey].compradores
			}`;
		})
		.join("\n")}

*Leads últimas 4 semanas:*
${weeks
	.map((week, index) => {
		const weekKey = `semana${index + 1}`;
		return `Sem. ${index + 1}: ${week[weekKey].total} - Compradores: ${
			week[weekKey].compradores
		}`;
	})
	.join("\n")}`;

	console.log(status);
	return status;
};

//statusLeads();
