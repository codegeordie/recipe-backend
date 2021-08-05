import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

export const ingredientsGetAll = async (req: Request, res: Response) => {
	const ingredients = req.app.locals.db.collection('ingredients')

	//let result = []
	const response = await ingredients
		.aggregate([
			{
				$match: {
					$and: [
						{ _id: { $exists: true } },
						{ tag_name: { $exists: false } },
						{ tagIndex: { $exists: false } },
					],
				},
			},
		])
		.toArray()

	res.json(response)
}

export const ingredientsGetById = async (req: Request, res: Response) => {
	const ingredients = req.app.locals.db.collection('ingredients')
	const query = req.query

	//let result = []
	const response = await ingredients
		.aggregate([{ $match: { _id: new ObjectId(query.id) } }])
		.toArray()

	res.json(response)
}

export const ingredientsGet = async (req: Request, res: Response) => {
	const ingredients = req.app.locals.db.collection('ingredients')
	const query = req.query

	//let result = []
	const reggie = new RegExp(query.name, 'i')
	const response = await ingredients
		.aggregate([
			{ $match: { name: { $regex: reggie } } },
			//NAME MATCHES FROM RECIPES?!?
		])
		.toArray()

	res.json(response)
}
