import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRequest } from '../../@types/types'

export const verifyNextAuthToken = (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	const token: string | undefined = req.cookies['next-auth.session-token']
	const secret = process.env.JWT_SECRET
	if (!secret) throw Error('A secret wasnt provided!')

	if (token) {
		jwt.verify(token, secret, (err, decoded) => {
			if (err) throw Error(`middleware cannot verify token. ${err.message}`)
			else {
				req.userId = decoded?.sub
				next()
			}
		})
	} else {
		next()
		//throw Error('no authentication token found')
	}
}
