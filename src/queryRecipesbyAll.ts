// import { Request, Response } from 'express'

// export async function queryRecipesByAll(req: Request) {
// 	const recipes = req.app.locals.db.collection('recipes')

// 	let result = []

// 	const lookupIngredients = {
// 		from: 'ingredients',
// 		localField: 'ingredients.ingredient_id',
// 		foreignField: '_id',
// 		as: 'ingredients_full',
// 	}

// 	result = await recipes
// 		.aggregate([
// 			{ $match: { _id: { $exists: true } } },
// 			{ $lookup: lookupIngredients },
// 		])
// 		.toArray()

// 	return result
// }
