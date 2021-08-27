import { Request } from 'express'

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
