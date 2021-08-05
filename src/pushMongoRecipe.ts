// import { ObjectId } from 'mongodb'
// import { updateMongo } from './updateMongo'
// import { Request } from 'express'

// export async function pushMongoRecipe(req: Request) {
// 	const recipes = req.app.locals.db.collection('recipes')
// 	const recipe = req.body

// 	const updatedRecipe = recipeUpdate(recipe)
// 	recipes.insertOne(updatedRecipe).then(updateMongo(req))
// }

// const recipeUpdate = recipe => {
// 	const newIngredients = recipe.ingredients.map(i => ({
// 		ingredient_id: new ObjectId(i.ingredient_id),
// 		quantity: unitConversion(parseInt(i.quantity), i.measure),
// 		measure: 'g',
// 	}))

// 	const newRecipe = {
// 		name: recipe.name,
// 		description: recipe.description,
// 		image: recipe.image,
// 		servings: parseInt(recipe.servings),
// 		tags: [],
// 		calories: 0,
// 		cost: { value: 0, currency: 'USD' },
// 		createdBy: new ObjectId(recipe.uid),
// 		ingredients: newIngredients,
// 	}

// 	return newRecipe
// }

// // converts other units to grams
// const unitConversion = (value, measure) => {
// 	let output = 0
// 	switch (measure) {
// 		case 'g':
// 			output = value
// 			break
// 		case 'oz':
// 			output = value * 28.3495
// 			break
// 		case 'lb':
// 			output = value * 453.592
// 			break
// 	}
// 	output = Math.round(output)
// 	return output
// }
