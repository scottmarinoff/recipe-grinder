import cheerio from "cheerio";

export const extractIngredients = (htmlContent) => {
  const $ = cheerio.load(htmlContent);

  const ingredients = [];
  $("div.ingredients.text p[itemprop='recipeIngredient']").each((i, el) => {
    const ingredientText = $(el).text();
    ingredients.push(ingredientText);
  });
  return ingredients;
};