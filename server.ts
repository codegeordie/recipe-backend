import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import formidable from 'formidable'
import { MongoClient, ObjectId } from 'mongodb'
import cookieParser from 'cookie-parser'

import { recipeRouter } from './src/routes/recipeRoutes'
import { ingredientRouter } from './src/routes/ingredientsRoutes'
import { userRouter } from './src/routes/userRoutes'

import { queryTags } from './src/queryTags'
import { verifyNextAuthToken } from './src/middleware/verifyNextAuthToken'

const PORT = process.env.PORT || 5001

const app = express()
app.set('trust proxy', 1)
//app.use(cors({ credentials: true, origin: 'https://recipe-1.vercel.app' }))
app.use(cors({ credentials: true, origin: true }))
//app.use(express.json())
app.use(express.json({ limit: '25mb' }))
app.use(express.urlencoded({ limit: '25mb', extended: true }))
////////////
app.use(cookieParser())
app.use(verifyNextAuthToken)

MongoClient.connect(process.env.DB_URL222, function (err, client) {
	if (err) throw new Error('Cannot connect to MongoDB')

	//app.locals.db = client?.db('recipe')
	app.locals.db = client?.db('recipedb')
	app.locals.dbNEW = client?.db('recipedb')
	if (!app.locals.db) throw new Error('Database is undefined')

	app.use('/api/recipes', recipeRouter)
	app.use('/api/ingredients', ingredientRouter)
	app.use('/api/users', userRouter)

	// currently: get all possible tags
	app.get('/api/tags', async (req, res) => {
		let dbRes = await queryTags(req)

		res.json(dbRes)
	})

	// image submit endpoint
	app.post('/api/imagesubmit', async (req, res) => {
		const form = new formidable.IncomingForm({
			uploadDir: './public/img',
			keepExtensions: true,
		})
		form.parse(req, (err, fields, files) => {
			// console.log(err, fields, files)
			let uploadFilePath = files.photo.path.replace('public/', '')

			res.json({ url: uploadFilePath })
		})
	})
	/////////////////

	// app.get('/api/testinggg/', async (req, res) => {
	// 	const recipes = req.app.locals.db.collection('recipes')
	// 	const query = req.query

	// 	let hasMore,
	// 		limit = 20,
	// 		cursor = query.cursor ?? 0

	// 	if (query.limit) limit = parseInt(query.limit)
	// 	console.log('limit :>> ', limit)
	// 	console.log('cursor :>> ', cursor)

	// 	const response = await recipes
	// 		.aggregate([
	// 			{ $match: { _id: { $exists: true } } },
	// 			{ $match: { _id: { $gt: new ObjectId(cursor) } } },
	// 		])
	// 		.sort({ _id: 1 })
	// 		.limit(limit)
	// 		.toArray()

	// 	cursor = response[limit - 1]._id
	// 	console.log('cursor :>> ', cursor)

	// 	res.json({ data: response, hasMore, cursor })
	// })

	///////////////
	app.listen(PORT, () => {
		console.log(`The application is listening on port ${PORT}!`)
	})
})

// function identity<Type>(arg?: Type): Type {
// 	return arg
// }
// const x = identity(1)
// console.log('x :>> ', x)
