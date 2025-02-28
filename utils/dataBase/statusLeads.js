import Leads from "../../models/leads.js";

// ... existing code ...
export const statusLeads = async () => {
	const currentDate = new Date();
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
		{ semana4: { total: 0, compradores: 0 } }
	];

	const weeklyData = await Leads.aggregate([
		{
			$unwind: "$flows"
		},
		{
			$addFields: {
				cleanDate: {
					$concat: [
						{ $substr: ["$flows.flowDate", 0, 10] },
						", ",
						{ $substr: ["$flows.flowDate", 12, 2] },
						":",
						{ $substr: ["$flows.flowDate", 15, 2] },
						":",
						{ $substr: ["$flows.flowDate", 18, 2] }
					]
				}
			}
		},
		{
			$addFields: {
				"flows.flowDate": {
					$dateFromString: {
						dateString: "$cleanDate",
						format: "%d/%m/%Y, %H:%M:%S"
					}
				}
			}
		},
		{
			$match: {
				"flows.flowDate": { $gte: fourWeeksAgo }
			}
		},
		{
			$group: {
				_id: {
					week: { $subtract: [{ $week: "$flows.flowDate" }, { $week: fourWeeksAgo }] }
				},
				totalCount: { $sum: 1 },
				purchasedCount: {
					$sum: {
						$cond: [{ $eq: ["$flows.client_status", "compró"] }, 1, 0]
					}
				}
			}
		},
		{
			$sort: { "_id.week": 1 }
		}
	]);

	// Asignar los resultados a la estructura de weeks
	weeklyData.forEach((data) => {
		const weekIndex = data._id.week;
		if (weekIndex >= 0 && weekIndex < weeks.length) {
			const weekKey = `semana${weekIndex + 1}`;
			weeks[weekIndex][weekKey].total = data.totalCount;
			weeks[weekIndex][weekKey].compradores = data.purchasedCount;
		}
	});

	// 4. Totales de los últimos 7 días
	let days = [
		{ dia1: { total: 0, compradores: 0 } },
		{ dia2: { total: 0, compradores: 0 } },
		{ dia3: { total: 0, compradores: 0 } },
		{ dia4: { total: 0, compradores: 0 } },
		{ dia5: { total: 0, compradores: 0 } },
		{ dia6: { total: 0, compradores: 0 } },
		{ dia7: { total: 0, compradores: 0 } }
	];

	const dailyData = await Leads.aggregate([
		{
			$unwind: "$flows"
		},
		{
			$addFields: {
				cleanDate: {
					$concat: [
						{ $substr: ["$flows.flowDate", 0, 10] },
						", ",
						{ $substr: ["$flows.flowDate", 12, 2] },
						":",
						{ $substr: ["$flows.flowDate", 15, 2] },
						":",
						{ $substr: ["$flows.flowDate", 18, 2] }
					]
				}
			}
		},
		{
			$addFields: {
				"flows.flowDate": {
					$dateFromString: {
						dateString: "$cleanDate",
						format: "%d/%m/%Y, %H:%M:%S"
					}
				}
			}
		},
		{
			$match: {
				"flows.flowDate": { $gte: sevenDaysAgo }
			}
		},
		{
			$group: {
				_id: { $dayOfWeek: "$flows.flowDate" },
				totalCount: { $sum: 1 },
				purchasedCount: {
					$sum: {
						$cond: [{ $eq: ["$flows.client_status", "compró"] }, 1, 0]
					}
				}
			}
		},
		{
			$sort: { _id: 1 }
		}
	]);

	// Asignar los resultados a la estructura de days
	dailyData.forEach((data) => {
		const dayIndex = data._id - 1;
		if (dayIndex >= 0 && dayIndex < days.length) {
			const dayKey = `dia${dayIndex + 1}`;
			days[dayIndex][dayKey].total = data.totalCount;
			days[dayIndex][dayKey].compradores = data.purchasedCount;
		}
	});

	const object = {
		leadsActivos: totalRecords,
		leadsConVendedor: withVendor,
		leadsSinVendedor: withoutVendor,
		semanalUltimas4Semanas: weeks,
		diarioUltimos7Dias: days
	};

	//console.log(object);
	console.log(object.diarioUltimos7Dias);
	console.log(object.semanalUltimas4Semanas);
	return object;
};

//statusLeads()

