const i18n = require('i18n');

// Set up i18n
i18n.configure({
  locales: ['en', 'fr', 'es'],
  directory: __dirname + '/../locales',
  defaultLocale: 'en',
  cookie: 'language'
});

// Define the language switcher API
exports.switchLanguage = (req, res) => {
  const language = req.params.language;
  res.cookie('language', language);
  res.redirect('back');
};
