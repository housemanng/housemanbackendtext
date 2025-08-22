import bcrypt from "bcryptjs";

import mongoose, { Schema, model, Document} from "mongoose";

//import { ISubscription } from './subscription';



export interface IUser extends Document {
  _id: string; // MongoDB ID
  phone_number: string; // User's phone number
  email: string; // User's email
  password: string; // User's password
  userType: string; // User's type (default: 'user')
  occupation: string; // User's occupation
  sex: 'male' | 'female' | 'other'; // User's sex
  bio?: string; // User bio
  skills?: string[]; // Array of user skills
  uvcCode: string; // Unique Verification Code
 
  ninDetails: {
    firstName: string; 
    middleName: string; 
    lastName: string; 
    dateOfBirth: string; 
  }; 
  
  

  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
  properties: mongoose.Types.ObjectId[]; // Array of property references
  lastLogin?: Date;
  createdAt: Date;
 
}












const userSchema = new Schema<IUser>(
  {
    ninDetails: {
      firstName: { type: String },
      middleName: { type: String },
      lastName: { type: String },
      dateOfBirth: { type: String },
    }, 
    
    
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, enum: ["user"], default: "user" }, // Default userType
    occupation: { type: String, required: true, maxlength: 15 },
    sex: { type: String, enum: ['male', 'female', 'other'], required: true },
   
    bio: { type: String, default: "" }, // User bio
  

    
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Hash the password before saving the user
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();


  console.log("Hashing password before save..."); // ✅ Debug log
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword: string){
  return await bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser>("User", userSchema);