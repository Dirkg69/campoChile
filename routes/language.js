const express = require('express');
const languageController = require('../controllers/language');

const router = express.Router();

router.get('/switch-language/:language', languageController.switchLanguage);

module.exports = router;
