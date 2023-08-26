import { hashPassword, comparePassword } from '../password';
import bcrypt from 'bcrypt';

jest.mock('bcrypt')

bcrypt.genSalt = jest.fn().mockReturnValue('salt');
bcrypt.hash = jest.fn().mockReturnValue('password hashed');
bcrypt.compare = jest.fn(async (password:string | Buffer, hashPassword:string):Promise<boolean> => {
  if(password === 'password' && hashPassword === 'password hashed') {
    return true;
  } else {
    return false;
  }
})


describe('Password', () => {
	it('returns a hashed password', async () => {

    const hashedPassword = await hashPassword('password');
    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toEqual('password');
    expect(hashedPassword).toEqual('password hashed');

	});

  it('returns true when password is compared to real hash', async () => {

    const isMatch = await comparePassword('password', 'password hashed');
    expect(isMatch).toBeTruthy();

	});

  it('returns false when password is compared to fake hash', async () => {

    const isMatch = await comparePassword('password', 'passwordnothashed');
    expect(isMatch).toBeFalsy();

	});

  it('returns false when invalid password is compared to real hash', async () => {

    const isMatch = await comparePassword('password123', 'password hashed');
    expect(isMatch).toBeFalsy();

	});
  

})