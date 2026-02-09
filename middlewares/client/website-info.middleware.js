const SettingWebsiteInfo = require("../../models/setting-webiste.info.model");

module.exports.websiteInfo = async (req, res, next) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  res.locals.settingWebsiteInfo = settingWebsiteInfo;
  next();
};
