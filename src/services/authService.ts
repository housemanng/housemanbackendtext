// import User from '../models/User';
// import bcrypt from 'bcryptjs';

// // Signup a new user
// export const signupService = async (userData: any) => {
//   const { password } = userData;
//   const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
//   const user = new User({ ...userData, password: hashedPassword });
//   return await user.save();
// };

// // Login an existing user
// export const loginService = async (email: string, password: string) => {
//   const user = await User.findOne({ email });
//   if (!user) {
//     throw new Error('User not found');
//   }
//   const isPasswordValid = await bcrypt.compare(password, user.password);
//   if (!isPasswordValid) {
//     throw new Error('Invalid password');
//   }
//   return user;
// };