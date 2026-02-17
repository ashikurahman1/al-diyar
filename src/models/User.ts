import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    accountType: 'user' | 'agent';
    emailVerified: boolean;
    // Agent-specific fields
    companyName?: string;
    licenseNumber?: string;
    businessAddress?: string;
    website?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 'Invalid email address'],
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^(\+?880|0)?1[3-9]\d{8}$/, 'Invalid Bangladesh phone number'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
        },
        accountType: {
            type: String,
            enum: ['user', 'agent'],
            required: [true, 'Account type is required'],
            default: 'user',
        },
        emailVerified: {
            type: Boolean,
            default: false,
        },
        // Agent-specific fields
        companyName: {
            type: String,
            trim: true,
        },
        licenseNumber: {
            type: String,
            trim: true,
        },
        businessAddress: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
            match: [/^https?:\/\/.+/, 'Invalid URL format'],
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
