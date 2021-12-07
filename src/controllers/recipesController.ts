import { Request, Response } from 'express'
import _ from 'lodash'
import { ObjectId } from 'mongodb'
import { UserRequest, RecipeBase } from '../../@types/types'
import { updateMongo } from '../updateMongo'

///////////////
export const recipesGetAll = async (req: Request, res: Response) => {
	console.log('getbyall')
	const recipes = req.app.locals.db.collection('recipes')

	const response = await recipes
		.aggregate([{ $match: { _id: { $exists: true } } }])
		.toArray()
	res.json(response)
}

//////////////
export const recipesGetById = async (req: Request, res: Response) => {
	console.log('getbyid')
	const recipes = req.app.locals.db.collection('recipes')
	const recipeId = req.params.id

	if (typeof recipeId !== 'string') {
		throw Error('Invalid query parameters. Recipe ID must be provided')
	}

	const response = await recipes
		.aggregate([{ $match: { _id: new ObjectId(recipeId) } }])
		.toArray()
	res.json(response[0])
}

//////////////////
export const recipesGet = async (req: UserRequest, res: Response) => {
	const recipes = req.app.locals.db.collection('recipes')
	const query = req.query

	let hasMore,
		limit = 100,
		cursor = query.cursor ?? 0,
		skip = 0,
		querySort = undefined

	if (query.limit) limit = parseInt(query.limit as string)
	if (query.skip) skip = parseInt(query.skip as string)
	if (query.recipeSort) {
		querySort = JSON.parse(query.recipeSort)
		cursor = 0
	}

	const sort = querySort ?? { _id: 1 }

	// query array start:
	const queryScaffold = [{ $match: { _id: { $gt: new ObjectId(cursor) } } }]

	// search recipes (by name)
	if (query.search) {
		const search = Array.isArray(query.search) ? query.search[0] : query.search
		const reggie = new RegExp(search as string, 'i')
		const nameQuery = { $match: { label: { $regex: reggie } } }
		queryScaffold.unshift(nameQuery)
	}

	// search by filter tags
	if (query.filters) {
		//@ts-ignore
		const tagFilter = [].concat(query.filters)
		const tagQuery = { $match: { healthLabels: { $all: tagFilter } } }
		queryScaffold.unshift(tagQuery)
	}

	// search by calories
	if (query.cal_max || query.cal_min) {
		const [cal_min, cal_max] = [
			parseInt(query.cal_min as string),
			parseInt(query.cal_max as string),
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

	//unmatch private recipes unless created by user
	// if (req.userId) {
	// 	if (query.showOnlyCreated === 'true') {
	// 		const showCreatedQuery = {
	// 			$match: { createdBy: new ObjectId(req.userId) },
	// 		}
	// 		queryScaffold.unshift(showCreatedQuery)
	// 	} else {
	// 		const createdByQuery = {
	// 			$match: {
	// 				$or: [{ isPrivate: false }, { createdBy: new ObjectId(req.userId) }],
	// 			},
	// 		}
	// 		queryScaffold.unshift(createdByQuery)
	// 	}
	// } else {
	// 	const privateQuery = { $match: { isPrivate: false } }
	// 	queryScaffold.unshift(privateQuery)
	// }

	// return all if no query provided
	// if (queryScaffold.length === 0) {
	// 	const defaultQuery = { $match: { _id: { $exists: true } } }
	// 	queryScaffold.unshift(defaultQuery)
	// }

	const calSet = {
		$set: {
			serving_cal: { $round: [{ $divide: ['$calories', '$yield'] }] },
		},
	}
	queryScaffold.unshift(calSet)

	// search mongodb with final query
	let result = await recipes
		.aggregate(queryScaffold)
		.sort(sort)
		.skip(skip)
		.limit(limit)
		.toArray()

	///
	cursor = result[limit - 1]?._id
	hasMore = cursor ? true : false
	if (querySort) {
		skip += limit
		cursor = 0
	}
	///

	// mark user favorites if logged in
	if (req.userId) {
		const users = req.app.locals.db.collection('users')
		const userId = new ObjectId(req.userId)
		const favoritesResponse = await users
			.find(userId)
			.project({ favorites: 1, _id: 0 })
			.toArray()

		const userFavorites = favoritesResponse[0]?.favorites

		result.forEach((recipe: RecipeBase) => {
			if (_.find(userFavorites, { recipeId: recipe._id })) {
				recipe.favorited = true
			} else {
				recipe.favorited = false
			}
		})

		if (query.showOnlyFavorites === 'true') {
			result = result.filter((recipe: RecipeBase) => {
				return recipe.favorited
			})
		}
	}

	// convert currency on results
	// if (query.currency) {
	// 	const convertCurrency = (
	// 		currObj: { value: number; curr?: string },
	// 		convTo: string
	// 	) => {
	// 		let ratioToUSD = 1
	// 		if (convTo === 'EUR') ratioToUSD = 1.18
	// 		else if (convTo === 'MXN') ratioToUSD = 20.13

	// 		return {
	// 			value: Math.round(currObj.value * ratioToUSD),
	// 			currency: convTo,
	// 		}
	// 	}

	// 	result = result.map((recipe: RecipeBase) => ({
	// 		...recipe,
	// 		cost: convertCurrency(recipe.cost, query.currency as string),
	// 	}))
	// 	//return converted
	// }
	res.json({ data: result, cursor, hasMore, skip })
}

//////////////////////

export const recipesDelete = async (req: UserRequest, res: Response) => {
	console.log('recipesDelete')
	const recipes = req.app.locals.db.collection('recipes')
	const recipeId = req.params.id

	const response = await recipes.deleteOne(
		{
			$and: [
				{ _id: new ObjectId(recipeId) },
				{ createdBy: new ObjectId(req.userId) },
			],
		}
		//res => console.log('res :>> ', res)
	)
	res.json(response)
}

//////////////////////

export const recipesUpdate = async (req: Request, res: Response) => {
	console.log('recipesUpdate')
	const recipes = req.app.locals.db.collection('recipes')
	const recipeId = req.params.id

	const response = await recipes.updateOne(
		{ _id: new ObjectId(recipeId) },
		{ $set: req.body }
	)

	res.json(response)
}

//////////////////////

export const recipesCreate = async (req: UserRequest, res: Response) => {
	console.log('recipesCreate')
	const recipes = req.app.locals.db.collection('recipes')
	const updatedRecipe = recipeUpdate(req.body, req.userId)

	//console.log('updatedRecipe :>> ', updatedRecipe)
	const response = recipes.insertOne(updatedRecipe).then(updateMongo(req))
	res.json(response)
}

const recipeUpdate = (recipe: RecipeBase, userId: string) => {
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
		ingredients: newIngredients,
		tags: [],
		calories: 0,
		cost: { value: 0, currency: 'USD' },
		createdBy: new ObjectId(userId),
		isPrivate: recipe.isPrivate,
		createdAt: new Date(),
		updatedAt: new Date(),
	}

	return newRecipe
}

// converts other units to grams
const unitConversion = (value: number, measure: string) => {
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
