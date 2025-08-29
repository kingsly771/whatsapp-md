const express = require('express');
const sessionController = require('../controllers/sessionController');

const router = express.Router();

router.post('/', sessionController.createSession);
router.get('/:sessionId/status', sessionController.getSessionStatus);
router.delete('/:sessionId', sessionController.disconnectSession);

// Add endpoint to get bot prefix info
router.get('/info/prefix', (req, res) => {
  const config = req.app.get('config');
  res.json({
    prefix: config.bot.prefix,
    adminPrefix: config.bot.adminPrefix
  });
});

module.exports = router;
