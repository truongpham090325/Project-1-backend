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
