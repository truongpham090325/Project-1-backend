const Category = require("../models/category.model");

// buildCategoryTree
const buildCategoryTree = (categories, parentId = "") => {
  const tree = [];
  categories.forEach((item) => {
    if (item.parent == parentId) {
      // Đệ quy tìm các danh mục con của danh mục hiện tại
      const children = buildCategoryTree(categories, item.id);

      tree.push({
        id: item.id,
        name: item.name,
        slug: item.slug,
        children: children, // Có thể là một mảng rỗng
      });
    }
  });

  return tree;
};

module.exports = buildCategoryTree;
// End buildCategoryTree

// getCategoryChild
const getCategoryChild = async (parentId) => {
  const result = [];
  const childList = await Category.find({
    parent: parentId,
    deleted: false,
    status: "active",
  });

  for (const item of childList) {
    result.push({
      id: item.id,
      name: item.name,
    });

    await getCategoryChild(item.id);
  }

  return result;
};

module.exports.getCategoryChild = getCategoryChild;
// End getCategoryChild
