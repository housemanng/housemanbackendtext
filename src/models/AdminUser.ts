
import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";








export interface IAdminUser extends Document {
  first_name: string; // First name of the admin
  middle_name?: string; // Middle name of the admin (optional)
  surname: string; // Surname of the admin
  phone_number: string; // Admin's phone number
  password: string; // Admin's password
  isAdmin: boolean; // Indicates if the user is an admin
  isSuperAdmin: boolean; // Indicates if the user is a super admin
//   createdBy: Types.ObjectId; // ID of the admin who created this admin
  created_at: Date; // Creation timestamp
  updated_at: Date; // Last update timestamp
  createdBy: Types.ObjectId; // ID of the admin who created this admin
  lastLogin: Date;
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
}

// AdminUser Schema
const adminUserSchema = new Schema<IAdminUser>(
  {
    first_name: { type: String, required: true }, // First name (required)
    middle_name: { type: String }, // Middle name (optional)
    surname: { type: String, required: true }, // Surname (required)
    phone_number: { type: String, required: true, unique: true }, // Phone number (required, unique)
    password: { type: String, required: true }, // Password (required)
    isAdmin: { type: Boolean, default: false }, // Default to false
    isSuperAdmin: { type: Boolean, default: false }, // Default to false
    
    lastLogin: { type: Date }, // Last login timestamp
    createdBy: { type: Schema.Types.ObjectId, ref: "AdminUser", }, // ID of the creator (required)
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Hash the password before saving the admin user
adminUserSchema.pre<IAdminUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
// adminUserSchema.methods.comparePassword = async function (candidatePassword: string) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// Method to compare passwords
adminUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default model<IAdminUser>("AdminUser", adminUserSchema);