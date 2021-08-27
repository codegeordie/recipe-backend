import { Request, Response, NextFunction } from 'express'
import { UserRequest } from '../../@types/types'

export const enforceNextAuthToken = (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	if (!req.userId) throw Error('(auth enforcement): user credentials invalid')
	else next()
}
