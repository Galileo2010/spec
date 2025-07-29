import bcrypt from 'bcryptjs'

const password = 'demo123'
const hash = '$2a$12$Ho1P.Rz.djnKYAVVvp5XgOTnz2u8QRP1QBke3X607iSUnqDkJPv0W'

console.log('Testing password:', password)
console.log('Against hash:', hash)

const isValid = await bcrypt.compare(password, hash)
console.log('Password valid:', isValid)

// Also test creating a new hash
const newHash = await bcrypt.hash(password, 12)
console.log('New hash:', newHash)
const newIsValid = await bcrypt.compare(password, newHash)
console.log('New hash valid:', newIsValid)