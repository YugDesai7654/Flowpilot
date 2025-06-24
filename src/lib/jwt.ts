import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "9cdH4+GLuK+sxOnmHCIlNSkLiMvjdo1bP3pvxBsVY8g="

export function signJwt(payload: object) {
  console.log("JWT_SECRET signJwt : ", process.env.JWT_SECRET)
  console.log("JWT_SECRET used in signJwt : ", JWT_SECRET)
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyJwt(token: string) {
  console.log("JWT_SECRET verifyJwt : ", process.env.JWT_SECRET)
  console.log("JWT_SECRET used in verifyJwt : ", JWT_SECRET)
    try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    console.log("Invalid token:", token)
    return null
  }
} 