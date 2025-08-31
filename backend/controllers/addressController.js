const Address = require('../models/Address');

// GET address by userId
exports.getByUserId = async (req, res) => {
  try {
    const address = await Address.findAll({ where: { userId: req.params.userId } });
    res.json(address);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ADD address
exports.add = async (req, res) => {
  try {
    const newAddress = await Address.create(req.body);
    res.status(201).json(newAddress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// UPDATE address
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Address.update(req.body, { where: { id } });
    if (!updated) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE address
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Address.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ error: 'Address not found' });
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
