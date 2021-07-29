import { Currency } from 'dinero.js'

type RecipeIngredients = {
	ingredient_id: string
	quantity: number
	measure: 'g' | 'oz' | 'lb'
}

export interface RecipeSubmittal {
	name: string
	description: string
	image: string
	//	tags: string[];
	servings: number
	ingredients: RecipeIngredients[]
}

export interface RecipeBase {
	_id: string
	name: string
	description: string
	image: string
	tags: string[]
	servings: number
	calories: number
	cost: { value: number; currency: Currency }
	ingredients: RecipeIngredients[]
}

export interface Recipe extends RecipeBase {
	ingredients_full: Ingredient[]
	serving_cal: number
}

export interface Ingredient {
	_id: string
	name: string
	quantity: number
	calories: number
	cost: {
		currency: Currency
		value: number
	}
}

export interface Tag {
	_id: string
	tag_name: string
}

export type Option = { id: string; label: string }
export type CheckboxFormProps = {
	options: Option[]
	initialChecked?: string[]
	onSubmit: (selectedOptions: Option[]) => void
}

export interface MongoQ_Name {
	name: string | undefined
}

interface MongoQ_Id {
	id: string
}

interface MongoQ_IdMany {
	id: string[]
}

interface MongoQ_Filters {
	filters: string[] | undefined
}

export type GetRecipesQuery = {
	name?: string
	filters?: string[]
	cal_min?: string
	cal_max?: string
}

// export type GetIngredientsQuery = {
// 	name?: string
// 	_id?: string
// }

// export type GetIngredientsQuery =
// 	| MongoQ_Name
// 	| MongoQ_Id
// 	| MongoQ_IdMany
// 	| undefined

export interface RArrayAsProps {
	recipesToRender: Recipe[]
}

export interface RecipeAsProps {
	recipe: Recipe
}

export interface IngredientsProps {
	ingrArray: Ingredient[]
	ingrRec?: RecipeIngredients[]
}

// export interface RecipePageProps {
// 	ingrArray: Ingredient[]
// }
