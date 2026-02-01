const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: "dyaeppaf1",
  api_key: "972824594995866",
  api_secret: "nEf6NsMTdpTiqMOngERtpMHGKoA",
});

module.exports.storage = new CloudinaryStorage({
  cloudinary: cloudinary,
});
