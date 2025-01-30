import stringSimilarity from 'string-similarity';

export const findSimilarIngredients = (ingredients) => {
  const similarPairs =;
  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      const similarity = stringSimilarity.compareTwoStrings(
        ingredients[i].name,
        ingredients[j].name
      );
      if (similarity > 0.8) { // Adjust the threshold as needed
        similarPairs.push([ingredients[i], ingredients[j]]);
      }
    }
  }
  return similarPairs;
};