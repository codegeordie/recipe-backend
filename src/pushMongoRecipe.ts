import { ObjectId } from 'mongodb'
import { updateMongo } from './updateMongo'

export async function pushMongoRecipe(req) {
	const recipes = req.app.locals.db.collection('recipes')
	//const query = req.query
	const recipe = req.body

	recipeUpdate(recipe)
	//const updatedRecipe = recipeUpdate(recipe)
	recipes.insertOne(recipe).then(updateMongo(req))
}

const recipeUpdate = recipe => {
	recipe.ingredients.forEach(i => {
		i.ingredient_id = new ObjectId(i.ingredient_id)
		i.quantity = unitConversion(parseInt(i.quantity), i.measure)
		i.measure = 'g'
	})

	recipe.servings = parseInt(recipe.servings)
	recipe.tags = []
	recipe.calories = 0
	recipe.cost = { value: 0, currency: 'USD' }
}

// converts other units to grams
const unitConversion = (value, measure) => {
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
