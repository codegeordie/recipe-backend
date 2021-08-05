import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const verifyNextAuthToken = (
	req: Request,
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
				console.log('decoded :>> ', decoded)
				next()
			}
		})
	} else {
		res.send('Token rejected')
		throw Error('TOKEN UNDEFINED IN AUTH MIDDLEWARE')
	}
}
