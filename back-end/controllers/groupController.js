const Group = require('../models/Group');
const Membership = require('../models/Membership');

exports.createGroup = async (req, res) => {
  try {
    const { tour_id, name, representative_id } = req.body;
    
    if (!tour_id || !name) {
      return res.status(400).json({ error: 'tour_id and name are required' });
    }

    const group = new Group({
      tour_id,
      name,
      representative_id: representative_id || null
    });
    
    await group.save();

    // If representative_id is selected, automatically update their role to group_rep and assign them to the group
    if (representative_id) {
      await Membership.findByIdAndUpdate(representative_id, {
        group_id: group._id,
        role: 'group_rep'
      });
    }

    res.status(201).json({ success: true, message: 'Group created successfully', group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupsByTour = async (req, res) => {
  try {
    const { tour_id } = req.query;
    if (!tour_id) {
      return res.status(400).json({ error: 'tour_id parameter is required' });
    }

    const groups = await Group.find({ tour_id })
      .populate({
        path: 'representative_id',
        populate: { path: 'user_id', select: 'name phone' }
      });

    res.status(200).json({ success: true, groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
