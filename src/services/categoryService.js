// Ingredient categories for the menu. Uses the shared apiClient (ADR 0003).
export function createCategoryService({ kitchenClient }) {
  return {
    async getCategories() {
      const categories = await kitchenClient.getAllPages('/categories');
      return categories.map((category) => ({ id: category.id, label: category.label }));
    },
  };
}
