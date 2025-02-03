import { randomBytes } from 'crypto';

export const generatenineUniqueId = () => {
    const bytes = randomBytes(7); 
    return bytes.toString('hex').substring(0, 9);
}
