const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

router.get('/:userId', addressController.getByUserId);
router.post('/', addressController.add);
router.put('/:id', addressController.update);
router.delete('/:id', addressController.remove);

module.exports = router;
