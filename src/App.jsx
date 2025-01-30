import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { extractIngredients } from "./utils/ingredientParser";
import { standardizeUnit } from "./utils/unitStandardizer";
import { findSimilarIngredients } from "./utils/ingredientMatcher";

function App() {

  // return <h1>Hello from Vercel!</h1>;
  
  const [ingredients, setIngredients] = useState();
  const [unitPreferences, setUnitPreferences] = useState(null);
  const [similarIngredients, setSimilarIngredients] = useState();
  const [originalZip, setOriginalZip] = useState(null); // Store the original zip file

  const handleFileChange = async (event) => {
    const file = event.target.files;
    if (file.type === "application/zip") {
      const zip = await JSZip.loadAsync(file);
      setOriginalZip(zip); // Store the zip file
      const htmlFiles = Object.values(zip.files).filter((file) =>
        file.name.endsWith(".html")
      );
      const allIngredients = await Promise.all(
        htmlFiles.map(async (file) => {
          const htmlContent = await file.async("string");
          const extractedIngredients = extractIngredients(htmlContent);
          return extractedIngredients.map((ingredient) => {
            const parts = ingredient.split(" ");
            const quantity = parts;
            const unit = standardizeUnit(parts);
            const name = parts.slice(2).join(" ");
            return { quantity, unit, name };
          });
        })
      );
      setIngredients(allIngredients.flat());
    } else {
      alert("Please upload a zip file.");
    }
  };

  const handlePreferencesChange = async (event) => {
    const file = event.target.files;
    if (file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const jsonContent = JSON.parse(event.target.result);
        setUnitPreferences(jsonContent);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a JSON file for preferences.");
    }
  };

  useEffect(() => {
    const similar = findSimilarIngredients(ingredients);
    setSimilarIngredients(similar);
  }, [ingredients]);

  const handleMerge = (index) => {
    const [ingredient1, ingredient2] = similarIngredients[index];
    const updatedIngredients = ingredients.map((ingredient) => {
      if (ingredient.name === ingredient2.name) {
        return {...ingredient, name: ingredient1.name };
      }
      return ingredient;
    });
    setIngredients(updatedIngredients);
    setSimilarIngredients(
      similarIngredients.filter((_, i) => i!== index)
    );
  };

  const handleSave = () => {
    if (!originalZip) {
      alert("Please upload a zip file first.");
      return;
    }

    const updatedZip = new JSZip();
    // Iterate over the original zip file entries
    originalZip.forEach(async (relativePath, file) => {
      if (file.name.endsWith(".html")) {
        let htmlContent = await file.async("string");
        // Replace the ingredients in the HTML with the updated ingredients
        const updatedIngredients = extractIngredients(htmlContent).map(
          (ingredientText) => {
            const parts = ingredientText.split(" ");
            const quantity = parts;
            const unit = standardizeUnit(parts);
            const name = parts.slice(2).join(" ");
            const updatedIngredient = ingredients.find(
              (ing) => ing.name === name
            );
            return updatedIngredient
            ? `${updatedIngredient.quantity} ${updatedIngredient.unit} ${updatedIngredient.name}`
            : ingredientText;
          }
        );
        // Update the HTML content with the new ingredients
        updatedIngredients.forEach((newIngredient, index) => {
          const oldIngredient = extractIngredients(htmlContent)[index];
          htmlContent = htmlContent.replace(oldIngredient, newIngredient);
        });
        // Add the updated HTML file to the new zip file
        updatedZip.file(file.name, htmlContent);
      } else {
        // Add other files to the new zip file without modification
        updatedZip.file(file.name, file._data.compressedContent);
      }
    });

    // Generate the updated zip file
    updatedZip.generateAsync({ type: "blob" }).then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "updated_recipes.zip";
      link.click();
    });
  };

  return (
    <div>
      <h1>Recipe Grinder</h1>
      <input type="file" onChange={handleFileChange} />
      <input type="file" onChange={handlePreferencesChange} />
      <button onClick={handleSave}>Save Changes</button>

      {ingredients.length > 0? ( // Conditionally render the lists
        <>
          <h2>Similar Ingredients:</h2>
          <ul>
            {similarIngredients.map(([ingredient1, ingredient2], index) => (
              <li key={index}>
                {ingredient1.name} - {ingredient2.name}
                <button onClick={() => handleMerge(index)}>Merge</button>
              </li>
            ))}
          </ul>

          <h2>Ingredients:</h2>
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                <span className="quantity">{ingredient.quantity}</span>
                <span className="unit">{ingredient.unit}</span>
                <span className="name">{ingredient.name}</span>
              </li>
            ))}
          </ul>
        </>
      ): (
        <p>Please upload a zip file to begin.</p> // Message to show initially
      )}
    </div>
  );
}

export default App;

// Default from install with vite@latest
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
