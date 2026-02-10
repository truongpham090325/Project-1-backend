const Category = require("../../models/category.model");

module.exports.list = async (req, res) => {
  try {
    const slug = req.params.slug;

    const categoryDetail = await Category.findOne({
      slug: slug,
      deleted: false,
      status: "active",
    });

    // Breadcrumb
    const breadcrumb = [];
    if (categoryDetail.parent) {
      const categoryParent = await Category.findOne({
        _id: categoryDetail.parent,
        deleted: false,
        status: "active",
      });

      if (categoryParent) {
        breadcrumb.push({
          name: categoryParent.name,
          slug: categoryParent.slug,
          avatar: categoryParent.avatar,
        });
      }
    }

    breadcrumb.push({
      name: categoryDetail.name,
      slug: categoryDetail.slug,
      avatar: categoryDetail.avatar,
    });
    // End Breadcrumb

    res.render("client/pages/tour-list", {
      pageTitle: categoryDetail.name,
      breadcrumb: breadcrumb,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};
