import { Request } from 'express'
import { ObjectId } from 'mongodb'
import { updateMongo } from '../updateMongo'

//
const lookupIngredients = {
	from: 'ingredients',
	localField: 'ingredients.ingredient_id',
	foreignField: '_id',
	as: 'ingredients_full',
}
//

export async function recipesFindAll(req: Request) {
	const recipes = req.app.locals.db.collection('recipes')

	let result = []

	result = await recipes
		.aggregate([
			{ $match: { _id: { $exists: true } } },
			{ $lookup: lookupIngredients },
		])
		.toArray()

	return result
}

//
//
//
//
//

export async function queryRecipes(req: Request) {
	const recipes = req.app.locals.db.collection('recipes')
	const query = req.query

	let result = []
	let tagFilter = [].concat(query.filters)
	let [cal_min, cal_max] = [parseInt(query.cal_min), parseInt(query.cal_max)]

	// const lookupIngredients = {
	// 	from: 'ingredients',
	// 	localField: 'ingredients.ingredient_id',
	// 	foreignField: '_id',
	// 	as: 'ingredients_full',
	// }

	const reggie = new RegExp(query.name, 'i')
	const nameQuery = { $match: { name: { $regex: reggie } } }
	const tagQuery = { $match: { tags: { $all: tagFilter } } }
	const calQuery = {
		$match: {
			$and: [
				{ serving_cal: { $gte: cal_min } },
				{ serving_cal: { $lte: cal_max } },
			],
		},
	}
	const calSet = {
		$set: {
			serving_cal: { $divide: ['$calories', '$servings'] },
		},
	}

	const defaultQuery = { $match: { _id: { $exists: true } } }

	const finalQuery = [{ $lookup: lookupIngredients }]

	if (query.name) finalQuery.unshift(nameQuery)
	if (query.filters) finalQuery.unshift(tagQuery)
	if (query.cal_max || query.cal_min) {
		finalQuery.unshift(calQuery)
		// finalQuery.unshift(calSet)
	}

	finalQuery.unshift(calSet)

	if (finalQuery.length === 1) finalQuery.unshift(defaultQuery)

	result = await recipes.aggregate(finalQuery).toArray()

	if (query.curr) {
		const convertCurrency = (currObj, convTo) => {
			let ratioToUSD = 1
			if (convTo === 'EUR') ratioToUSD = 1.18
			else if (convTo === 'MXN') ratioToUSD = 20.13

			return {
				value: Math.round(currObj.value * ratioToUSD),
				currency: convTo,
			}
		}

		const converted = result.map(recipe => ({
			...recipe,
			cost: convertCurrency(recipe.cost, query.curr),
		}))
		return converted
	}

	return result
}

//
//
//
//
//

export async function queryRecipesById(req: Request) {
	const recipes = req.app.locals.db.collection('recipes')
	const query = req.query

	let result = []

	// const lookupIngredients = {
	// 	from: 'ingredients',
	// 	localField: 'ingredients.ingredient_id',
	// 	foreignField: '_id',
	// 	as: 'ingredients_full',
	// }

	result = await recipes
		.aggregate([
			{ $match: { _id: new ObjectId(query.id) } },
			{ $lookup: lookupIngredients },
		])
		.toArray()

	return result
}

//
//
//
//
//

export async function pushMongoRecipe(req: Request) {
	const recipes = req.app.locals.db.collection('recipes')
	const recipe = req.body

	recipeUpdate(recipe)
	//const updatedRecipe = recipeUpdate(recipe)

	recipes.insertOne(recipe).then(updateMongo(req))
}

const recipeUpdate = recipe => {
	recipe.ingredients.forEach(i => {
		i.ingredient_id = new ObjectId(i.ingredient_id)
		i.quantity = unitConversion(parseInt(i.quantity), i.measure)
		i.measure = 'g'
	})

	recipe.servings = parseInt(recipe.servings)
	recipe.tags = []
	recipe.calories = 0
	recipe.cost = { value: 0, currency: 'USD' }
	// new
	recipe.createdBy = new ObjectId(recipe.uid)
	recipe.createdAt = Date.now()
	recipe.updatedAt = Date.now()
}

// converts other units to grams
const unitConversion = (value, measure) => {
	let output = 0
	switch (measure) {
		case 'g':
			output = value
			break
		case 'oz':
			output = value * 28.3495
			break
		case 'lb':
			output = value * 453.592
			break
	}
	output = Math.round(output)
	return output
}

//
//
//
//
//
//
