import { Request } from 'express'
//import { recipesCreate } from './controllers/recipesController'

export async function queryTags(req: Request) {
	const recipes = req.app.locals.db.collection('recipes')
	//const ingredients = req.app.locals.db.collection('ingredients')
	//const query = req.query

	// const result = await ingredients
	// 	.find({ tag_name: { $exists: true } })
	// 	.toArray()

	const result = await recipes
		.aggregate([
			{ $unwind: '$healthLabels' },
			{ $group: { _id: { tag_name: '$healthLabels' } } },
		])
		.toArray()

	return result
}
