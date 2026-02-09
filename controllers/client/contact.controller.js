const Contact = require("../../models/contact.model");

module.exports.createPost = async (req, res) => {
  try {
    const existEmail = await Contact.findOne({
      email: req.body.email,
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Email của bạn đã từng được đăng ký!",
      });
      return;
    }

    const newRecord = new Contact(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Bạn đã đăng ký nhận email thành công!",
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
};
