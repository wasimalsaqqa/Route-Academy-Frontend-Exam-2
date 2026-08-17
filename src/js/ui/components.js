const categoryStyleMap = {
  'Beef': {bg: 'bg-red-100 text-red-700 border-red-200', iconBg: 'bg-red-500', icon: 'fa-drumstick-bite'},
  'Chicken': {bg: 'bg-orange-100 text-orange-700 border-orange-200', iconBg: 'bg-orange-500', icon: 'fa-kiwi-bird'},
  'Dessert': {bg: 'bg-purple-100 text-purple-700 border-purple-200', iconBg: 'bg-purple-500', icon: 'fa-cake-candles'},
  'Lamb': {bg: 'bg-amber-100 text-amber-700 border-amber-200', iconBg: 'bg-amber-500', icon: 'fa-bone'},
  'Miscellaneous': {bg: 'bg-gray-100 text-gray-700 border-gray-200', iconBg: 'bg-gray-400', icon: 'fa-bowl-food'},
  'Pasta': {bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', iconBg: 'bg-yellow-500', icon: 'fa-bowl-rice'},
  'Pork': {bg: 'bg-red-100 text-red-700 border-red-200', iconBg: 'bg-red-500', icon: 'fa-bacon'},
  'Seafood': {bg: 'bg-blue-100 text-blue-700 border-blue-200', iconBg: 'bg-blue-500', icon: 'fa-fish'},
  'Side': {bg: 'bg-green-100 text-green-700 border-green-200', iconBg: 'bg-green-500', icon: 'fa-carrot'},
  'Starter': {bg: 'bg-teal-200 text-teal-700 border-teal-200', iconBg: 'bg-emerald-600', icon: 'fa-utensils'},
  'Vegan': {bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', iconBg: 'bg-emerald-500', icon: 'fa-leaf'},
  'Vegetarian': {bg: 'bg-lime-100 text-lime-700 border-lime-200', iconBg: 'bg-lime-500', icon: 'fa-seedling'},
  'Default': {bg: 'bg-gray-100 text-gray-700 border-gray-200', iconBg: 'bg-gray-500', icon: 'fa-utensils'}
};

export const createLoadingSpinner = () => {
  return `
    <div class="flex items-center justify-center py-12 w-full">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  `;
};

export const createEmptyState = (title = 'No recipes found', subtitle = 'Try searching for something else') => {
  return `
    <div class="flex flex-col items-center justify-center py-12 text-center w-full col-span-full">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
      </div>
      <p class="text-gray-500 text-lg">${title}</p>
      <p class="text-gray-400 text-sm mt-2">${subtitle}</p>
    </div>
  `;
};

export const createRecipeCard = (meal) => {
  const desc = (meal.instructions && meal.instructions.length > 0)
    ? meal.instructions[0].substring(0, 70) + '...'
    : 'Delicious recipe to try!';

  const imageUrl = meal.image || meal.thumbnail || meal.strMealThumb || '';

  return `
    <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${meal.id}">
      <div class="relative h-48 overflow-hidden">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="${imageUrl}" alt="${meal.name}" loading="lazy" />
        <div class="absolute bottom-3 left-3 flex gap-2">
          <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${meal.category || 'General'}</span>
          <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${meal.area || 'Global'}</span>
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">${meal.name}</h3>
        <p class="text-xs text-gray-600 mb-3 line-clamp-2">${desc}</p>
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-900">
            <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>${meal.category || 'General'}
          </span>
          <span class="font-semibold text-gray-500">
            <i class="fa-solid fa-globe text-blue-500 mr-1"></i>${meal.area || 'Global'}
          </span>
        </div>
      </div>
    </div>
  `;
};

export const createCategoryCard = (category) => {
  const catName = category.name || category.title || category.category || category.strCategory || 'Unknown';
  const style = categoryStyleMap[catName] || categoryStyleMap['Default'];

  return `
    <div class="category-card ${style.bg} rounded-xl p-3 border hover:shadow-md cursor-pointer transition-all group" data-category="${catName}">
      <div class="flex items-center gap-2.5">
        <div class="text-white w-9 h-9 ${style.iconBg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <i class="fa-solid ${style.icon}"></i>
        </div>
        <div>
          <h3 class="text-sm font-bold truncate">${catName}</h3>
        </div>
      </div>
    </div>
  `;
};

export const createAreaPill = (area, isActive = false) => {
  const areaName = area.name || area.area || area.strArea || area;

  if (isActive) {
    return `<button class="px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all filter-area-btn" data-area="${areaName}">${areaName}</button>`;
  }
  return `<button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all filter-area-btn" data-area="${areaName}">${areaName}</button>`;
};

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const createMealDetailsView = (meal, nutrition = {}) => {
  const imageUrl = meal.image || meal.thumbnail || meal.strMealThumb || '';
  const ingredients = meal.ingredients || [];
  const instructions = meal.instructions || [];
  const ytId = getYoutubeId(meal.youtube || meal.strYoutube);
  
  const cals = Math.round(nutrition.calories || 0);
  const totalCals = Math.round(nutrition.totalCalories || (cals * 4));
  const protein = Math.round(nutrition.protein || 0);
  const carbs = Math.round(nutrition.carbs || 0);
  const fat = Math.round(nutrition.fat || 0);
  const fiber = Math.round(nutrition.fiber || 0);
  const sugar = Math.round(nutrition.sugar || 0);
  const satFat = Math.round(nutrition.saturatedFat || nutrition.satFat || 0);
  const cholesterol = Math.round(nutrition.cholesterol || 0);
  const sodium = Math.round(nutrition.sodium || 0);

  const ingredientsHtml = ingredients.map(ing => {
    let displayText = ing;
    if (typeof ing === 'object' && ing !== null) {
      const measure = ing.measure || ing.amount || '';
      const name = ing.name || ing.ingredient || ing.text || '';
      displayText = `${measure} ${name}`.trim();
    }
    return `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
        <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
        <span class="text-gray-700">${displayText}</span>
      </div>
    `;
  }).join('');

  const instructionsHtml = instructions.map((step, index) => `
    <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
      <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${index + 1}</div>
      <p class="text-gray-700 leading-relaxed pt-2">${step}</p>
    </div>
  `).join('');

  return `
    <div class="max-w-7xl mx-auto">
      <!-- Back Button -->
      <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to Recipes</span>
      </button>

      <!-- Hero Section -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div class="relative h-80 md:h-96">
          <img src="${imageUrl}" alt="${meal.name}" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="flex items-center gap-3 mb-3">
              <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.category || 'General'}</span>
              <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.area || 'Global'}</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.name}</h1>
            <div class="flex items-center gap-6 text-white/90">
              <span class="flex items-center gap-2"><i class="fa-solid fa-clock"></i> <span>30 min</span></span>
              <span class="flex items-center gap-2"><i class="fa-solid fa-utensils"></i> <span>4 servings</span></span>
              <span class="flex items-center gap-2"><i class="fa-solid fa-fire"></i> <span>${cals} cal/serving</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-wrap gap-3 mb-8">
        <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all" data-meal-id="${meal.id}">
          <i class="fa-solid fa-clipboard-list"></i>
          <span>Log This Meal</span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-emerald-600"></i> Ingredients
              <span class="text-sm font-normal text-gray-500 ml-auto">${ingredients.length} items</span>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${ingredientsHtml}
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-shoe-prints text-emerald-600"></i> Instructions
            </h2>
            <div class="space-y-4">
              ${instructionsHtml}
            </div>
          </div>

          ${ytId ? `
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-video text-red-500"></i> Video Tutorial
            </h2>
            <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
              <iframe src="https://www.youtube.com/embed/${ytId}" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe>
            </div>
          </div>` : ''}
        </div>

        <!-- Right Column - Nutrition Facts -->
        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-emerald-600"></i> Nutrition Facts
            </h2>
            <div>
              <p class="text-sm text-gray-500 mb-4">Per serving</p>
              
              <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
                <p class="text-sm text-gray-600">Calories per serving</p>
                <p class="text-4xl font-bold text-emerald-600">${cals}</p>
                <p class="text-xs text-gray-500 mt-1">Total: ${totalCals} cal</p>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-emerald-500"></div><span class="text-gray-700">Protein</span></div>
                  <span class="font-bold text-gray-900">${protein}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min(100, (protein/150)*100)}%"></div></div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-blue-500"></div><span class="text-gray-700">Carbs</span></div>
                  <span class="font-bold text-gray-900">${carbs}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(100, (carbs/250)*100)}%"></div></div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-purple-500"></div><span class="text-gray-700">Fat</span></div>
                  <span class="font-bold text-gray-900">${fat}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min(100, (fat/70)*100)}%"></div></div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-orange-500"></div><span class="text-gray-700">Fiber</span></div>
                  <span class="font-bold text-gray-900">${fiber}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-orange-500 h-2 rounded-full" style="width: ${Math.min(100, (fiber/30)*100)}%"></div></div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-pink-500"></div><span class="text-gray-700">Sugar</span></div>
                  <span class="font-bold text-gray-900">${sugar}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-pink-500 h-2 rounded-full" style="width: ${Math.min(100, (sugar/50)*100)}%"></div></div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-red-500"></div><span class="text-gray-700">Saturated Fat</span></div>
                  <span class="font-bold text-gray-900">${satFat}g</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-red-500 h-2 rounded-full" style="width: ${Math.min(100, (satFat/20)*100)}%"></div></div>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div><p class="text-xs text-gray-500">Cholesterol</p><p class="font-bold text-gray-900">${cholesterol}mg</p></div>
                <div><p class="text-xs text-gray-500">Sodium</p><p class="font-bold text-gray-900">${sodium}mg</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const createProductCard = (product, index = 0) => {
  const name = product.product_name || product.name || 'Unknown Product';
  const brand = product.brands || product.brand || 'Unknown Brand';
  const image = product.image_front_url || product.image_url || product.image || 'https://via.placeholder.com/150';
  const quantity = product.quantity || '-';
  const barcode = product.code || product._id || product.id || product.barcode || '';
  
  const rawScore = product.nutriscore_grade || product.nutrition_grades || product.nutrition_grade_fr || product.nutrition_grades_tags?.[0] || 'UNKNOWN';
  const nutriScore = String(rawScore).toUpperCase();
  const novaGroup = product.nova_group || product.nova || '';
  
  const safeNum = (val) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
  const n = product.nutrition || product.nutriments || product.nutrients || product.data?.perServing || product.perServing || product || {};
  
  const cals = n.calories || n.energy || n['energy-kcal_100g'] || n['energy-kcal'] || n.ENERC_KCAL || 0;
  const protein = safeNum(n.protein || n.proteins || n.proteins_100g || n.PROCNT);
  const carbs = safeNum(n.carbs || n.carbohydrates || n.carbohydrates_100g || n.CHOCDF);
  const fat = safeNum(n.fat || n.fats || n.fat_100g || n.FAT);
  const sugar = safeNum(n.sugar || n.sugars || n.sugars_100g || n.SUGAR);

  const scoreColors = {'A': 'bg-[#008b4c]', 'B': 'bg-[#80c342]', 'C': 'bg-[#feca0b]', 'D': 'bg-[#f58220]', 'E': 'bg-[#ef3e22]'};
  const scoreColor = scoreColors[nutriScore] || 'bg-gray-400';

  return `
    <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative cursor-pointer product-card group" data-barcode="${barcode}" data-index="${index}">
      <div class="absolute top-4 left-4 z-10">
        <span class="${scoreColor} text-white text-[10px] font-extrabold px-2 py-1 rounded-sm tracking-wider">NUTRI-SCORE ${nutriScore !== 'UNKNOWN' ? nutriScore : '?'}</span>
      </div>
      ${novaGroup ? `
      <div class="absolute top-4 right-4 z-10">
        <span class="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm">${novaGroup}</span>
      </div>` : ''}
      
      <div class="h-40 w-full flex items-center justify-center mb-4 overflow-hidden rounded-xl bg-gray-50 p-2 group-hover:bg-emerald-50 transition-colors">
        <img src="${image}" alt="${name}" class="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" loading="lazy">
      </div>

      <div class="mb-4">
        <p class="text-xs text-emerald-600 font-bold mb-1 truncate">${brand}</p>
        <h3 class="font-bold text-gray-900 text-base leading-tight line-clamp-2 mb-2 h-10">${name}</h3>
        <div class="flex items-center gap-3 text-xs text-gray-500 font-medium">
          <span class="flex items-center gap-1"><i class="fa-solid fa-scale-balanced"></i> ${quantity}</span>
          <span class="flex items-center gap-1"><i class="fa-solid fa-fire"></i> ${Math.round(cals)} kcal</span>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-1 text-center bg-gray-50 rounded-xl p-2 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
        <div><p class="text-emerald-500 font-bold text-xs">${protein.toFixed(1)}g</p><p class="text-[9px] text-gray-400 mt-0.5">Protein</p></div>
        <div><p class="text-blue-500 font-bold text-xs">${carbs.toFixed(1)}g</p><p class="text-[9px] text-gray-400 mt-0.5">Carbs</p></div>
        <div><p class="text-purple-500 font-bold text-xs">${fat.toFixed(1)}g</p><p class="text-[9px] text-gray-400 mt-0.5">Fat</p></div>
        <div><p class="text-amber-500 font-bold text-xs">${sugar.toFixed(1)}g</p><p class="text-[9px] text-gray-400 mt-0.5">Sugar</p></div>
      </div>
    </div>
  `;
};

const formatIngredient = (ing) => {
  if (typeof ing === 'string') return ing;
  if (typeof ing === 'object' && ing !== null) {
    const measure = ing.measure || ing.amount || '';
    const name = ing.name || ing.ingredient || ing.text || '';
    return `${measure} ${name}`.trim();
  }
  return String(ing);
};

