import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import formidable from 'formidable'
import { MongoClient } from 'mongodb'
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

MongoClient.connect(process.env.DB_URL as string, function (err, client) {
	if (err) throw new Error('Cannot connect to MongoDB')

	app.locals.db = client?.db('recipe')
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

	///////////////
	app.listen(PORT, () => {
		console.log(`The application is listening on port ${PORT}!`)
	})
})
