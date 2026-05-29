const Membership = require('../models/Membership');

// Business Rule 4: Auto approve after 2 days
const autoApproveMembers = async () => {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await Membership.updateMany(
      { 
        status: 'pending', 
        createdAt: { $lte: twoDaysAgo } 
      },
      { $set: { status: 'approved' } }
    );

    console.log(`[Job Auto-Approve] ${result.modifiedCount} memberships approved.`);
  } catch (error) {
    console.error('[Job Auto-Approve] Error:', error);
  }
};

module.exports = autoApproveMembers;
