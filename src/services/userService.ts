import User from '../models/User';
// import {
//   // verifyNINById,
//   verifyBVNById,
//   verifyDriverLicenseById,
//   verifyInternationalPassportById,
//   verifyAddressById,
// } from './verificationService';

// Create a new user
export const createUserService = async (userData: any) => {
  const user = new User(userData);
  return await user.save();
};

// Get user by uvcCode from the database
export const getUserByUvcCodeService = async (uvcCode: string) => {
  const user = await User.findOne({ uvcCode }); // Query for user by uvcCode
  return user;
};



// Update a user
export const updateUserService = async (id: string, updateData: any) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};







// Verify NIN by user ID
export const verifyNINById = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');



  // Generate a UVC code if it doesn't exist
  if (!user.uvcCode) {
    user.uvcCode = generateUvcCode();
  }

  // Add random NIN details (simulating NIMC API response)
  user.ninDetails = {
    firstName: generateRandomName(),
    middleName: generateRandomName(),
    lastName: generateRandomName(),
    dateOfBirth: generateFormattedDateOfBirth(),
  };

  
  await user.save();
  return user;
};

// Helper function to generate UVC code
const generateUvcCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const randomLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const randomNumbers = Array.from({ length: 6 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');

  return `${randomLetters}${randomNumbers}`; // Format: ABC123456
};

// Helper function to generate a random name
const generateRandomName = () => {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Emma', 'Daniel', 'Olivia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

  const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return `${randomFirstName} ${randomLastName}`;
};

// Helper function to generate a formatted date of birth
const generateFormattedDateOfBirth = () => {
  const day = Math.floor(Math.random() * 28) + 1; // Random day between 1 and 28
  const month = Math.floor(Math.random() * 12); // Random month between 0 and 11
  const year = Math.floor(Math.random() * (2000 - 1920 + 1)) + 1920; // Random year between 1920 and 2000

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const formattedDay = `${day}${getOrdinalSuffix(day)}`; // Add ordinal suffix (e.g., 1st, 2nd, 3rd)
  const formattedMonth = months[month];
  const formattedYear = year;

  return `${formattedDay} ${formattedMonth} ${formattedYear}`;
};

// Helper function to get the ordinal suffix for a day
const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return 'th'; // 11th, 12th, 13th, etc.
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};











