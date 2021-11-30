import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRequest } from '../../@types/types'

export const verifyNextAuthToken = (
	req: UserRequest,
	res: Response,
	next: NextFunction
) => {
	const secret = process.env.JWT_SECRET
	if (!secret) throw Error('(auth verification): JWT secret undefined')

	const token: string | undefined =
		req.cookies['next-auth.session-token'] ??
		req.cookies['__Secure-next-auth.session-token']
	//console.log('token :>> ', token)

	if (!token) {
		//console.log('no token')
		req.userId = undefined
		next()
	} else {
		jwt.verify(token, secret, (err, decoded) => {
			if (err)
				throw Error(`(auth verification): Cannot verify token. ${err.message}`)
			else {
				try {
					req.userId = decoded?.sub
					//console.log('verifcation successful')
					//console.log('decoded :>> ', decoded)
				} catch (err) {
					console.log('(auth verification): possibly no userId found :>> ', err)
					req.userId = undefined
				} finally {
					next()
				}
			}
		})
	}
}
