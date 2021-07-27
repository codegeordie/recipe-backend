import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import formidable from 'formidable'
import { MongoClient } from 'mongodb'

import { queryRecipes } from './src/queryRecipesByFilter'
import { queryRecipesById } from './src/queryRecipesById'
import { queryRecipesByAll } from './src/queryRecipesbyAll'
import {
	queryIngredientsByAll,
	queryIngredientsByName,
} from './src/queryIngredients'
import { queryTags } from './src/queryTags'
import { pushMongoRecipe } from './src/pushMongoRecipe'

const app = express()
app.use(cors())

MongoClient.connect('mongodb://localhost:27017', function (err, client) {
	if (err) throw new Error('Cannot connect to MongoDB')

	app.locals.db = client?.db('recipe')
	if (!app.locals.db) throw new Error('Database is undefined')

	// app.get('/api/recipes/', async (req: Request, res: Response) => {
	// 	let dbRes = await queryRecipes(req)

	// 	res.json(dbRes)
	// })
	////////////////

	// recipe by ID endpoint
	app.get('/api/recipeid/', async (req, res) => {
		let dbRes = await queryRecipesById(req)

		res.json(dbRes)
	})

	// all recipes endpoint
	app.get('/api/allrecipes/', async (req, res) => {
		let dbRes = await queryRecipesByAll(req)

		res.json(dbRes)
	})

	// recipe search endpoint
	app.get('/api/recipes/', async (req, res) => {
		let dbRes = await queryRecipes(req)

		res.json(dbRes)
	})

	// ingredients endpoint
	app.get('/api/ingredients_by_name/', async (req, res) => {
		let dbRes = await queryIngredientsByName(req)

		res.json(dbRes)
	})

	// ingredients endpoint
	app.get('/api/ingredients_all/', async (req, res) => {
		let dbRes = await queryIngredientsByAll(req)

		res.json(dbRes)
	})

	// recipe submit endpoint
	app.post('/api/submitrecipe/', async (req, res) => {
		// let dbRes = pushMongoRecipe(req.body)
		let dbRes = pushMongoRecipe(req)
		//console.log('dbRes :>> ', await dbRes)

		res.status(200)
		// res.end(JSON.stringify(dbRes))
	})

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

	app.listen(5001, () => {
		console.log('The application is listening on port 5001!')
	})
})

// function identity<Type>(arg?: Type): Type {
// 	return arg
// }

// const x = identity(1)

// console.log('x :>> ', x)
