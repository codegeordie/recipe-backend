import { Request } from 'express'

export type NIngredients = {
	text: string
	weight: number
	foodCategory: string
	foodId: string
	image: string
}

export type NRecipe = {
	_id: string
	uri: string
	label: string
	image: string
	source: string
	url: string
	shareAs: string
	yield: string
	dietLabels: string[]
	healthLabels: string[]
	cautions: string[]
	ingredientLines: string[]
	ingredients: NIngredients[]
	calories: number
	totalWeight: number
	totalTime: number
	cuisineType: string[]
	mealType: string[]
	dishType: string[]
	totalNutrients: any
	totalDaily: any
	digest: any
}

////////
export type UserRequest = Request & {
	userId?: string
}

/////

export type RecipeIngredients = {
	ingredient_id: string
	quantity: number
	measure: 'g' | 'oz' | 'lb'
}

export type RecipeBase = {
	_id: string
	name: string
	description: string
	image: string
	tags: string[]
	servings: number
	calories: number
	cost: { value: number; currency: string }
	ingredients: RecipeIngredients[]
	favorited?: boolean
	uid?: string
	createdBy?: string
	isPrivate?: boolean
	createdAt?: Date
	updatedAt?: Date
}
