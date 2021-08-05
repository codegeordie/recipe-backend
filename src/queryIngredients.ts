// import { ObjectId } from 'mongodb'
// import { Request } from 'express'

// export async function queryIngredientsByAll(req: Request) {
// 	const ingredients = req.app.locals.db.collection('ingredients')

// 	let result = []
// 	result = await ingredients
// 		.aggregate([
// 			{
// 				$match: {
// 					$and: [
// 						{ _id: { $exists: true } },
// 						{ tag_name: { $exists: false } },
// 						{ tagIndex: { $exists: false } },
// 					],
// 				},
// 			},
// 		])
// 		.toArray()

// 	return result
// }

// export async function queryIngredientsByName(req: Request) {
// 	const ingredients = req.app.locals.db.collection('ingredients')
// 	const query = req.query

// 	let result = []
// 	const reggie = new RegExp(query.name, 'i')
// 	result = await ingredients
// 		.aggregate([
// 			{ $match: { name: { $regex: reggie } } },
// 			//NAME MATCHES FROM RECIPES?!?
// 		])
// 		.toArray()

// 	return result
// }

// export async function queryIngredientsById(req: Request) {
// 	const ingredients = req.app.locals.db.collection('ingredients')
// 	const query = req.query

// 	let result = []
// 	result = await ingredients
// 		.aggregate([{ $match: { _id: new ObjectId(query.id) } }])
// 		.toArray()

// 	return result
// }
