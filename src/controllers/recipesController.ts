import { Request, Response } from 'express'
import _ from 'lodash'
import { ObjectId } from 'mongodb'
import { UserRequest, RecipeBase } from '../../@types/types'
import { updateMongo } from '../updateMongo'

//
const lookupIngredients = {
	from: 'ingredients',
	localField: 'ingredients.ingredient_id',
	foreignField: '_id',
	as: 'ingredients_full',
}
//

///////////////
export const recipesGetAll = async (req: Request, res: Response) => {
	console.log('recipesGetAll')
	const recipes = req.app.locals.db.collection('recipes')

	const response = await recipes
		.aggregate([
			{ $match: { _id: { $exists: true } } },
			{ $lookup: lookupIngredients },
		])
		.toArray()
	res.json(response)
}

//////////////
export const recipesGetById = async (req: Request, res: Response) => {
	console.log('recipesGetById')
	const recipes = req.app.locals.db.collection('recipes')
	const recipeId = req.params.id

	if (typeof recipeId !== 'string') {
		throw Error('Invalid query parameters. Recipe ID must be provided')
	}

	const response = await recipes
		.aggregate([
			{ $match: { _id: new ObjectId(recipeId) } },
			{ $lookup: lookupIngredients },
		])
		.toArray()
	res.json(response)
}

//////////////////
export const recipesGet = async (req: UserRequest, res: Response) => {
	console.log('recipesGet')
	const recipes = req.app.locals.db.collection('recipes')
	const query = req.query

	type QueryScaffold = {}[]
	// core query array
	const queryScaffold: QueryScaffold = [{ $lookup: lookupIngredients }]

	// search recipes (by name)
	if (query.search) {
		const search = Array.isArray(query.search) ? query.search[0] : query.search
		const reggie = new RegExp(search as string, 'i')
		const nameQuery = { $match: { name: { $regex: reggie } } }
		queryScaffold.unshift(nameQuery)
	}

	//search by filter tags
	if (query.filters) {
		//@ts-ignore
		const tagFilter = [].concat(query.filters)
		const tagQuery = { $match: { tags: { $all: tagFilter } } }
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

	//add user favorites boolean
	if (req.userId) {
		const users = req.app.locals.db.collection('users')
		const userId = new ObjectId(req.userId)
		const favoritesResponse = await users
			.find(userId)
			.project({ favorites: 1, _id: 0 })
			.toArray()
		const userFavorites = favoritesResponse[0].favorites

		result.forEach((recipe: RecipeBase) => {
			if (_.find(userFavorites, { recipeId: recipe._id })) {
				recipe.favorited = true
			} else {
				recipe.favorited = false
			}
		})
	}

	// convery currency on results

	if (query.curr) {
		const convertCurrency = (
			currObj: { value: number; curr?: string },
			convTo: string
		) => {
			let ratioToUSD = 1
			if (convTo === 'EUR') ratioToUSD = 1.18
			else if (convTo === 'MXN') ratioToUSD = 20.13

			return {
				value: Math.round(currObj.value * ratioToUSD),
				currency: convTo,
			}
		}

		const converted = result.map((recipe: RecipeBase) => ({
			...recipe,
			cost: convertCurrency(recipe.cost, query.curr as string),
		}))
		return converted
	}

	res.json(result)
}

//////////////////////

export const recipesDelete = async (req: Request, res: Response) => {
	console.log('recipesDelete')
	const recipes = req.app.locals.db.collection('recipes')
	const recipeId = req.params.id

	const response = await recipes.deleteOne({ _id: new ObjectId(recipeId) })
	res.json(response)
}

//////////////////////

export const recipesUpdate = async (req: Request, res: Response) => {
	console.log('recipesUpdate')
	const recipes = req.app.locals.db.collection('recipes')
	const recipeId = req.params.id

	const response = recipes.updateOne(
		{ _id: new ObjectId(recipeId) },
		{ $set: req.body }
	)

	res.json(response)
}

//////////////////////

export const recipesCreate = async (req: Request, res: Response) => {
	console.log('recipesCreate')
	const recipes = req.app.locals.db.collection('recipes')
	const updatedRecipe = recipeUpdate(req.body)
	console.log('updatedRecipe :>> ', updatedRecipe)
	const response = recipes.insertOne(updatedRecipe).then(updateMongo(req))
	res.json(response)
}

const recipeUpdate = (recipe: RecipeBase) => {
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
