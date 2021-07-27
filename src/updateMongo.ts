import { intersection } from 'lodash'

export async function updateMongo(req) {
	const recipes = req.app.locals.db.collection('recipes')
	const ingredients = req.app.locals.db.collection('ingredients')
	//const query = req.query

	// const { client } = await connectMongo()
	// const db = client.db('recipe')
	// const recipes = db.collection('recipes')
	// const ingredients = db.collection('ingredients')

	//this function needs serious improvement

	let ingredientTruth = await ingredients.find().toArray()
	let currentCost = 0
	let currentCalories = 0
	let allTags = ['vegan', 'vegetarian', 'paleo', 'gluten-free', 'no peanuts']
	let currentTags = allTags

	recipes.find().forEach(recipe => {
		recipe.ingredients.map(ingredient => {
			for (let i of ingredientTruth) {
				if (ingredient.ingredient_id.equals(i._id)) {
					currentCost += (i.cost.value / i.quantity) * ingredient.quantity
					currentCalories += (i.calories / i.quantity) * ingredient.quantity
					currentTags = intersection(currentTags, i.tags)
				}
			}
		})
		currentCost = Math.round(currentCost / recipe.servings)
		currentCalories = Math.round(currentCalories / recipe.servings)
		recipes.update(
			{ _id: recipe._id },
			{
				$set: {
					tags: currentTags,
					cost: {
						value: currentCost,
						currency: 'USD',
					},
					calories: currentCalories,
				},
			}
		)
		currentCost = 0
		currentCalories = 0
		currentTags = allTags
	})
	console.log('mongo recipes updated to current price')
}
