import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const verifyNextAuthToken = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.cookies['next-auth.session-token']
	const secret = process.env.JWT_SECRET

	if (token) {
		jwt.verify(token, secret, (err, decoded) => {
			if (err) console.log('err :>> ', err)
			else console.log('decoded :>> ', decoded)
		})
	} else {
		throw Error('TOKEN UNDEFINED IN AUTH MIDDLEWARE')
	}
	next()
}
