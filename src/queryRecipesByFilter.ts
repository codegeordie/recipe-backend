// import { Request, Response } from 'express'

// export async function queryRecipes(req: Request) {
// 	const recipes = req.app.locals.db.collection('recipes')
// 	const query = req.query

// 	let result = []
// 	let tagFilter = [].concat(query.filters)
// 	let [cal_min, cal_max] = [parseInt(query.cal_min), parseInt(query.cal_max)]

// 	const lookupIngredients = {
// 		from: 'ingredients',
// 		localField: 'ingredients.ingredient_id',
// 		foreignField: '_id',
// 		as: 'ingredients_full',
// 	}

// 	const reggie = new RegExp(query.name, 'i')
// 	const nameQuery = { $match: { name: { $regex: reggie } } }
// 	const tagQuery = { $match: { tags: { $all: tagFilter } } }
// 	const calQuery = {
// 		$match: {
// 			$and: [
// 				{ serving_cal: { $gte: cal_min } },
// 				{ serving_cal: { $lte: cal_max } },
// 			],
// 		},
// 	}
// 	const calSet = {
// 		$set: {
// 			serving_cal: { $divide: ['$calories', '$servings'] },
// 		},
// 	}

// 	const defaultQuery = { $match: { _id: { $exists: true } } }

// 	const finalQuery = [{ $lookup: lookupIngredients }]

// 	if (query.name) finalQuery.unshift(nameQuery)
// 	if (query.filters) finalQuery.unshift(tagQuery)
// 	if (query.cal_max || query.cal_min) {
// 		finalQuery.unshift(calQuery)
// 		// finalQuery.unshift(calSet)
// 	}

// 	finalQuery.unshift(calSet)

// 	if (finalQuery.length === 1) finalQuery.unshift(defaultQuery)

// 	result = await recipes.aggregate(finalQuery).toArray()

// 	if (query.curr) {
// 		const convertCurrency = (currObj, convTo) => {
// 			let ratioToUSD = 1
// 			if (convTo === 'EUR') ratioToUSD = 1.18
// 			else if (convTo === 'MXN') ratioToUSD = 20.13

// 			return {
// 				value: Math.round(currObj.value * ratioToUSD),
// 				currency: convTo,
// 			}
// 		}

// 		const converted = result.map(recipe => ({
// 			...recipe,
// 			cost: convertCurrency(recipe.cost, query.curr),
// 		}))
// 		return converted
// 	}

// 	return result
// }
