import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import formidable from 'formidable'
import { MongoClient } from 'mongodb'
import cookieParser from 'cookie-parser'

import { recipeRouter } from './src/routes/recipeRoutes'
import { ingredientRouter } from './src/routes/ingredientsRoutes'

import { queryTags } from './src/queryTags'
import { queryUserFavorites } from './src/queryUserFavorites'
import { addUserFavorite } from './src/addUserFavorite'
import { verifyNextAuthToken } from './src/middleware/verifyNextAuthToken'

const app = express()
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(express.json())
app.use(cookieParser())

MongoClient.connect('mongodb://localhost:27017', function (err, client) {
	if (err) throw new Error('Cannot connect to MongoDB')

	app.locals.db = client?.db('recipe')
	if (!app.locals.db) throw new Error('Database is undefined')

	app.use('/api/recipes', recipeRouter)
	app.use('/api/ingredients/', ingredientRouter)

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

	//////////////
	///////////////

	app.get('/api/favorites', verifyNextAuthToken, async (req, res) => {
		let dbRes = await queryUserFavorites(req)

		res.json(dbRes)
	})

	app.post('/api/favorites', async (req, res) => {
		let dbRes = await addUserFavorite(req)

		res.json(dbRes)
	})

	///////////////////////////

	app.listen(5001, () => {
		console.log('The application is listening on port 5001!')
	})
})

// function identity<Type>(arg?: Type): Type {
// 	return arg
// }

// const x = identity(1)

// console.log('x :>> ', x)
