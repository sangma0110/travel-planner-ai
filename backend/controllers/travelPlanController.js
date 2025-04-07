const TravelPlan = require('../models/TravelPlan');

exports.createPlan = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, preferences, content } = req.body;
    const userId = req.session.user.id;

    const plan = await TravelPlan.create({
      user: userId,
      destination,
      startDate,
      endDate,
      budget,
      preferences,
      content
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUserPlans = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const plans = await TravelPlan.find({ user: userId })
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    console.error('Get user plans error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await TravelPlan.findOne({
      _id: req.params.id,
      user: req.session.user.id
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, preferences, content } = req.body;
    
    const plan = await TravelPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.session.user.id },
      { destination, startDate, endDate, budget, preferences, content },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await TravelPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.session.user.id
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}; 