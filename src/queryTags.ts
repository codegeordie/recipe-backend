import { Request } from 'express'

export async function queryTags(req: Request) {
	//const recipes = req.app.locals.db.collection('recipes')
	const ingredients = req.app.locals.db.collection('ingredients')
	//const query = req.query

	const result = await ingredients
		.find({ tag_name: { $exists: true } })
		.toArray()

	return result
}
