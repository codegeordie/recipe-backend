import { Request } from 'express'

export type UserRequest = Request & {
	userId?: string
}

/////

type RecipeIngredients = {
	ingredient_id: string
	quantity: number
	measure: 'g' | 'oz' | 'lb'
}

export interface RecipeBase {
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
}
