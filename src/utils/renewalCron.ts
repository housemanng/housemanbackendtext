import cron from 'node-cron';
import AdminSettings, { IAdminSettings } from '../models/adminSettings';
import { deductFee } from './feeUtils';
import { ActivityLog } from '../models/ActivityLog';
import User from '../models/User';
import Subscription from '../models/subscription';

// Function to handle renewal for a single user
const processUserRenewal = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    const adminSettings = await AdminSettings.findOne();

    if (!user || !adminSettings) {
      console.error(`User or admin settings not found for user ${userId}`);
      return;
    }

    // Check if subscription is still active
    if (user.subscriptionStatus && user.nextRenewalDate && new Date(user.nextRenewalDate) > new Date()) {
      console.log(`Subscription still active for user ${userId}`);
      return;
    }

    const renewalFee = adminSettings.AnnualFee;

    // Check if user has sufficient balance
    if (user.wallet.balance < renewalFee) {
      console.log(`Insufficient balance for user ${userId}`);
      user.subscriptionStatus = false;
      await user.save();
      return;
    }

    // Deduct the fee
    const feeResult = await deductFee(
      userId,
      //'AnnualFee',
      ["AnnualFee", "ServiceFee"] as Array<keyof IAdminSettings>,
      'Yearly Subscription Renewal',
      'user'
    );

    if (!feeResult.success) {
      console.log(`Failed to deduct fee for user ${userId}: ${feeResult.message}`);
      user.subscriptionStatus = false;
      await user.save();
      return;
    }

    // Create new subscription document with amount
    const newSubscription = new Subscription({
      user: userId,
      subscriptionStatus: true,
      lastRenewalDate: new Date(),
      nextRenewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      subscriptionType: 'Standard',
      amount: renewalFee
    });

    // Save the new subscription
    await newSubscription.save();

    // Update user's subscription status and add new subscription to array
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          subscriptionStatus: true,
          lastRenewalDate: new Date(),
          nextRenewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          'wallet.balance': user.wallet.balance - renewalFee
        },
        $push: {
          subscriptions: newSubscription._id
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log(`Failed to update user subscription for user ${userId}`);
      return;
    }

    // Create activity log
    await ActivityLog.create({
      user: userId,
      action: 'Automatic Yearly Subscription Renewal',
      details: `Automatically renewed subscription. Amount: ₦${renewalFee.toLocaleString()}`,
      status: 'success'
    });

    console.log(`Successfully renewed subscription for user ${userId}`);
  } catch (error) {
    console.error(`Error processing renewal for user ${userId}:`, error);
  }
};

// Schedule the cron job to run daily at midnight
export const startRenewalCron = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      // Find all users whose subscription is due for renewal
      const users = await User.find({
        nextRenewalDate: { $lte: new Date() }
      });

      console.log(`Found ${users.length} users due for renewal`);

      // Process each user's renewal
      for (const user of users) {
        await processUserRenewal(user._id.toString());
      }
    } catch (error) {
      console.error('Error in renewal cron job:', error);
    }
  });
};