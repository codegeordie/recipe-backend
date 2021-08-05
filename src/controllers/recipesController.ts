import { Request, Response } from 'express'
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

interface Recipe {}

//////////////
export const recipesGetById = async (req: Request, res: Response) => {
	const recipes = req.app.locals.db.collection('recipes')
	const recipeId = req.params.id

	if (typeof recipeId !== 'string') {
		throw Error('Invalid query parameters. Recipe ID must be provided')
	}

	const response: Recipe = await recipes
		.aggregate([
			{ $match: { _id: new ObjectId(recipeId) } },
			{ $lookup: lookupIngredients },
		])
		.toArray()
	res.json(response)
}

//////////////
export const recipesGetAll = async (req: Request, res: Response) => {
	const recipes = req.app.locals.db.collection('recipes')
	const response: Recipe[] = await recipes
		.aggregate([
			{ $match: { _id: { $exists: true } } },
			{ $lookup: lookupIngredients },
		])
		.toArray()
	res.json(response)
}

//////////////////
export const recipesGet = async (req: Request, res: Response) => {
	const recipes = req.app.locals.db.collection('recipes')
	const query = req.query

	// core query array
	const queryScaffold = [{ $lookup: lookupIngredients }]

	// search by name
	if (query.name) {
		const name = Array.isArray(query.name) ? query.name[0] : query.name
		const reggie = new RegExp(name, 'i')
		const nameQuery = { $match: { name: { $regex: reggie } } }
		queryScaffold.unshift(nameQuery)
	}

	//search by filter tags
	if (query.filters) {
		const tagFilter = [].concat(query.filters)
		const tagQuery = { $match: { tags: { $all: tagFilter } } }
		queryScaffold.unshift(tagQuery)
	}

	// search by calories
	if (query.cal_max || query.cal_min) {
		const [cal_min, cal_max] = [
			parseInt(query.cal_min),
			parseInt(query.cal_max),
		]
		const calQuery = {
			$match: {
				$and: [
					{ serving_cal: { $gte: cal_min } },
					{ serving_cal: { $lte: cal_max } },
				],
			},
		}
		queryScaffold.unshift(calQuery)
	}

	// return all if no query provided
	const defaultQuery = { $match: { _id: { $exists: true } } }
	if (queryScaffold.length === 1) queryScaffold.unshift(defaultQuery)

	const calSet = {
		$set: {
			serving_cal: { $divide: ['$calories', '$servings'] },
		},
	}
	queryScaffold.unshift(calSet)

	// search mongodb with final query
	const result = await recipes.aggregate(queryScaffold).toArray()

	// convery currency on results
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

	res.json(result)
}

//////////////////////
export const recipesCreate = async (req: Request, res: Response) => {
	const recipes = req.app.locals.db.collection('recipes')
	const updatedRecipe = recipeUpdate(req.body)

	const response = recipes.insertOne(updatedRecipe).then(updateMongo(req))
	res.json(response)
}

const recipeUpdate = recipe => {
	const newIngredients = recipe.ingredients.map(i => ({
		ingredient_id: new ObjectId(i.ingredient_id),
		quantity: unitConversion(parseInt(i.quantity), i.measure),
		measure: 'g',
	}))

	const newRecipe = {
		name: recipe.name,
		description: recipe.description,
		image: recipe.image,
		servings: parseInt(recipe.servings),
		tags: [],
		calories: 0,
		cost: { value: 0, currency: 'USD' },
		createdBy: new ObjectId(recipe.uid),
		ingredients: newIngredients,
	}

	return newRecipe
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
