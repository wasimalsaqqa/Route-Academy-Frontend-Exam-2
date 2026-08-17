import{AppState} from './state/appState.js';
import{searchMeals, fetchCategories, fetchAreas, getMealById, analyzeRecipeNutrition, searchProducts, getProductByBarcode} from './api/mealdb.js';
import{createRecipeCard, createCategoryCard, createEmptyState, createLoadingSpinner, createAreaPill, createMealDetailsView, createProductCard} from './ui/components.js';

const app = new AppState();

const loadingOverlay = document.getElementById('app-loading-overlay');
const recipesGrid = document.getElementById('recipes-grid');
const recipesCount = document.getElementById('recipes-count');
const categoriesGrid = document.getElementById('categories-grid');

const mealsSections = [
  document.getElementById('search-filters-section'),
  document.getElementById('meal-categories-section'),
  document.getElementById('all-recipes-section')
];
const mealDetailsSection = document.getElementById('meal-details');
const productsSection = document.getElementById('products-section');
const foodlogSection = document.getElementById('foodlog-section');

let currentMealData = null;
let currentNutritionData = null;
let currentProductsData = [];

const renderFoodLog = () => {
  if (!foodlogSection) return;

  if (productsSection && productsSection.parentElement && foodlogSection.parentElement !== productsSection.parentElement) {
    productsSection.parentElement.appendChild(foodlogSection);
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const totals = app.getTodayTotals();
  const goals = app.dailyGoals;
  const todayLog = app.getTodayLog();

  const getMacroUI = (label, total, goal, unit) => {
    const isOver = total > goal;
    const percent = Math.min(100, Math.round((total / goal) * 100)) || 0;
    const color = isOver ? '#ef4444' : (label === 'Calories' ? '#10b981' : (label === 'Protein' ? '#3b82f6' : (label === 'Carbs' ? '#f59e0b' : '#a855f7')));

    return `
      <div class="rounded-2xl p-5 flex-1 shadow-sm" style="background-color: #f9fafb; border: 1px solid #f3f4f6;">
        <div class="flex items-center justify-between text-sm mb-3">
          <span class="font-medium" style="color: #374151;">${label}</span>
          <span class="text-xs font-semibold" style="color: ${isOver ? '#ef4444' : '#6b7280'};">${percent}%</span>
        </div>
        <div class="w-full rounded-full h-2 mb-3" style="background-color: #e5e7eb;">
          <div class="h-2 rounded-full transition-all duration-500" style="background-color: ${color}; width: ${percent}%;"></div>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold" style="color: ${color};">${Math.round(total)} ${unit}</span>
          <span style="color: #9ca3af;">/ ${goal} ${unit}</span>
        </div>
      </div>
    `;
  };

  const itemsHtml = todayLog.length > 0 ? todayLog.map(item => `
    <div class="flex items-center justify-between p-4 mb-3 shadow-sm rounded-2xl" style="background-color: white; border: 1px solid #f3f4f6;">
      <div class="flex items-center gap-4">
        <img src="${item.image || 'https://via.placeholder.com/150'}" class="w-16 h-16 rounded-2xl object-cover shadow-sm" alt="Food image">
        <div>
          <h4 class="font-bold text-base" style="color: #111827;">${item.name || 'Unknown Item'}</h4>
          <p class="text-xs mt-1" style="color: #6b7280;">${item.servings} serving${item.servings !== 1 ? 's' : ''} • <span class="font-medium" style="color: #10b981;">${item.type || 'Food'}</span></p>
          <p class="text-[10px] mt-1 uppercase tracking-wider" style="color: #9ca3af;">${item.time || ''}</p>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div class="text-right">
          <p class="font-bold text-xl" style="color: #10b981;">${Math.round(item.calories)}<br><span class="text-[10px] font-normal" style="color: #9ca3af;">kcal</span></p>
        </div>
        <div class="hidden sm:flex gap-3 text-xs font-medium w-40 justify-end" style="color: #6b7280;">
          <span>${Math.round(item.protein)}g P</span>
          <span>${Math.round(item.carbs)}g C</span>
          <span>${Math.round(item.fats)}g F</span>
        </div>
        <button class="delete-log-btn transition-colors p-2 cursor-pointer" style="color: #9ca3af;" data-id="${item.logId}" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#9ca3af'">
          <i class="fa-solid fa-trash-can text-lg"></i>
        </button>
      </div>
    </div>
  `).join('') : `
    <div class="text-center py-12 rounded-2xl border border-dashed" style="background-color: white; border-color: #e5e7eb;">
      <i class="fa-solid fa-utensils text-4xl mb-3" style="color: #d1d5db;"></i>
      <p class="font-medium" style="color: #111827;">No items logged today</p>
      <p class="text-sm mt-1" style="color: #6b7280;">Add meals from the Recipes page to track your nutrition</p>
    </div>
  `;

  const weekDays = [];
  let weeklyTotalCals = 0;
  let weeklyTotalItems = 0;
  let daysOnGoal = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString();
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();

    const dayLogs = app.foodLog.filter(log => log.date === dateStr);
    const dayCals = dayLogs.reduce((sum, log) => sum + (parseFloat(log.calories) || 0), 0);

    weeklyTotalItems += dayLogs.length;
    weeklyTotalCals += dayCals;
    if (dayCals > 0 && dayCals <= app.dailyGoals.calories) daysOnGoal++;

    const isActive = i === 0;
    const bgColor = isActive ? '#eef2ff' : 'transparent';
    const textColor = isActive ? '#312e81' : '#6b7280';
    const numColor = isActive ? '#111827' : '#6b7280';
    const calColor = isActive && dayCals > 0 ? '#10b981' : '#9ca3af';

    weekDays.push(`
      <div class="flex flex-col items-center justify-center rounded-2xl py-3 px-5 shadow-sm border" style="background-color: ${bgColor}; border-color: ${isActive ? '#e0e7ff' : 'transparent'}; color: ${textColor};">
        <span class="text-xs font-medium mb-1">${dayName}</span>
        <span class="text-lg font-bold mb-2" style="color: ${numColor};">${dayNum}</span>
        <span class="text-sm font-bold" style="color: ${calColor};">${Math.round(dayCals)}</span>
        <span class="text-[10px] mt-0.5" style="color: #9ca3af;">${isActive ? dayLogs.length + ' items' : 'kcal'}</span>
      </div>
    `);
  }
  
  const weeklyAvg = Math.round(weeklyTotalCals / 7);

  foodlogSection.innerHTML = `
    <div class="max-w-5xl mx-auto py-8 px-4 w-full">
      <div class="rounded-2xl p-6 mb-8 shadow-md flex justify-between items-center" style="background: linear-gradient(to right, #8b5cf6, #d946ef); color: white;">
        <div>
          <h2 class="text-2xl font-bold mb-1 flex items-center gap-2"><i class="fa-solid fa-clipboard-list"></i> Daily Food Log</h2>
          <p class="text-sm" style="color: rgba(255,255,255,0.9);">Track and monitor your daily nutrition intake</p>
        </div>
        <div class="text-right">
          <p class="text-sm" style="color: rgba(255,255,255,0.8);">Today</p>
          <p class="text-xl font-bold">${todayStr}</p>
        </div>
      </div>

      <div class="rounded-2xl p-6 mb-8 shadow-sm" style="background-color: white; border: 1px solid #f3f4f6;">
        <h3 class="text-lg font-bold mb-6 flex items-center gap-2" style="color: #111827;">
          <i class="fa-solid fa-fire" style="color: #f97316;"></i> Today's Nutrition
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${getMacroUI('Calories', totals.calories, goals.calories, 'kcal')}
          ${getMacroUI('Protein', totals.protein, goals.protein, 'g')}
          ${getMacroUI('Carbs', totals.carbs, goals.carbs, 'g')}
          ${getMacroUI('Fat', totals.fats, goals.fats, 'g')}
        </div>
      </div>

      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold" style="color: #374151;">Logged Items (${todayLog.length})</h3>
          ${todayLog.length > 0 ? `
            <button id="clear-all-log-btn" class="text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer" style="color: #ef4444;" onmouseover="this.style.color='#dc2626'" onmouseout="this.style.color='#ef4444'">
              <i class="fa-solid fa-trash"></i> Clear All
            </button>
          ` : ''}
        </div>
        <div>
          ${itemsHtml}
        </div>
      </div>

      <div class="rounded-2xl p-6 shadow-sm" style="background-color: white; border: 1px solid #f3f4f6;">
        <h3 class="text-lg font-bold mb-6 flex items-center gap-2" style="color: #111827;">
          <i class="fa-solid fa-calendar-week" style="color: #6366f1;"></i> Weekly Overview
        </h3>
        
        <div class="flex justify-between items-center mb-8 overflow-x-auto pb-2">
          ${weekDays.join('')}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-2xl p-4 flex items-center gap-4 shadow-sm" style="background-color: white; border: 1px solid #f3f4f6;">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style="background-color: #ecfdf5; color: #10b981;"><i class="fa-solid fa-chart-line"></i></div>
            <div><p class="text-xs font-medium mb-1" style="color: #6b7280;">Weekly Average</p><p class="text-xl font-bold" style="color: #111827;">${weeklyAvg} kcal</p></div>
          </div>
          <div class="rounded-2xl p-4 flex items-center gap-4 shadow-sm" style="background-color: white; border: 1px solid #f3f4f6;">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style="background-color: #eff6ff; color: #3b82f6;"><i class="fa-solid fa-utensils"></i></div>
            <div><p class="text-xs font-medium mb-1" style="color: #6b7280;">Total Items This Week</p><p class="text-xl font-bold" style="color: #111827;">${weeklyTotalItems} items</p></div>
          </div>
          <div class="rounded-2xl p-4 flex items-center gap-4 shadow-sm" style="background-color: white; border: 1px solid #f3f4f6;">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style="background-color: #f5f3ff; color: #a855f7;"><i class="fa-solid fa-bullseye"></i></div>
            <div><p class="text-xs font-medium mb-1" style="color: #6b7280;">Days On Goal</p><p class="text-xl font-bold" style="color: #111827;">${daysOnGoal} / 7</p></div>
          </div>
        </div>
      </div>
    </div>
  `;
};

const handleRoute = () => {
  const hash = window.location.hash.replace('#', '') || 'meals';
  app.setCurrentPage(hash);

  mealsSections.forEach(section => { if (section) section.style.display = 'none'; });
  if (mealDetailsSection) mealDetailsSection.style.display = 'none';
  if (productsSection) productsSection.style.display = 'none';
  if (foodlogSection) foodlogSection.style.display = 'none';

  const headerTitle = document.querySelector('#header h1');
  const headerDesc = document.querySelector('#header p');
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.className = 'nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all';
  });

  const setActiveLink = (targetHash) => {
    const activeLink = document.querySelector(`.nav-link[href="#${targetHash}"]`);
    if (activeLink) {
      activeLink.className = 'nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all';
    }
  };

  if (hash === 'products') {
    if (productsSection) {
      productsSection.style.display = '';
    }
    if (headerTitle) headerTitle.textContent = 'Product Scanner';
    if (headerDesc) headerDesc.textContent = 'Search packaged foods by name or barcode';
    setActiveLink('products');

  } else if (hash === 'foodlog') {
    if (foodlogSection) {
      foodlogSection.style.display = '';
      renderFoodLog();
    }
    if (headerTitle) headerTitle.textContent = 'Food Log';
    if (headerDesc) headerDesc.textContent = 'Track your daily nutrition and food intake';
    setActiveLink('foodlog');

  } else if (hash.startsWith('meal-details')) {
    if (mealDetailsSection) mealDetailsSection.style.display = '';
    if (headerTitle) headerTitle.textContent = 'Recipe Details';
    if (headerDesc) headerDesc.textContent = 'View full recipe information and nutrition facts';
    setActiveLink('meals'); 

  } else {
    mealsSections.forEach(section => { if (section) section.style.display = ''; });
    if (headerTitle) headerTitle.textContent = 'Meals & Recipes';
    if (headerDesc) headerDesc.textContent = 'Discover delicious and nutritious recipes tailored for you';
    setActiveLink('meals');
  }
};

window.addEventListener('hashchange', handleRoute);

const loadInitialData = async () => {
  try {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
      loadingOverlay.style.opacity = '1';
    }
    recipesGrid.innerHTML = createLoadingSpinner();

    const areasContainer = document.querySelector('#search-filters-section .overflow-x-auto');

    const [categories, areas, meals] = await Promise.all([
      fetchCategories(),
      fetchAreas(),
      searchMeals('chicken', 1, 25)
    ]);

    if (categories && categoriesGrid) {
      categoriesGrid.innerHTML = categories.slice(0, 12).map(cat => createCategoryCard(cat)).join('');
    }

    if (areas && areasContainer) {
      let areasHtml = createAreaPill('All Cuisines', true);
      areasHtml += areas.map(area => createAreaPill(area, false)).join('');
      areasContainer.innerHTML = areasHtml;
    }

    if (meals && meals.length > 0) {
      recipesGrid.innerHTML = meals.map(meal => createRecipeCard(meal)).join('');
      if (recipesCount) recipesCount.textContent = `Showing ${meals.length} recipes`;
    } else {
      recipesGrid.innerHTML = createEmptyState();
      if (recipesCount) recipesCount.textContent = `Showing 0 recipes`;
    }

  } catch (error) {
    console.error('Failed to load initial data:', error);
    recipesGrid.innerHTML = createEmptyState('Error loading data', 'Please check your connection and try again.');
  } finally {
    if (loadingOverlay) {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
      }, 500);
    }
  }
};

recipesGrid.addEventListener('click', async (e) => {
  const card = e.target.closest('.recipe-card');
  if (!card) return;

  const mealId = card.dataset.mealId;
  if (!mealId) return;

  try {
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
      loadingOverlay.style.opacity = '1';
    }

    const meal = await getMealById(mealId);
    if (!meal) throw new Error('Meal not found');

    const rawIngredients = meal.ingredients || [];
    const formattedIngredients = rawIngredients.map(ing => {
      if (typeof ing === 'string') return ing;
      if (typeof ing === 'object' && ing !== null) {
        const measure = ing.measure || ing.amount || '';
        const name = ing.name || ing.ingredient || ing.text || '';
        return `${measure} ${name}`.trim();
      }
      return String(ing);
    });

    let nutrition = {};
    try {
      const nutrResponse = await analyzeRecipeNutrition(meal.name, formattedIngredients);
      nutrition = nutrResponse?.data?.perServing || {};
    } catch (nutrError) {
      console.warn('Nutrition fetch skipped:', nutrError);
    }

    currentMealData = meal;
    currentNutritionData = nutrition;

    if (mealDetailsSection) {
      mealDetailsSection.innerHTML = createMealDetailsView(meal, nutrition);
    }

    window.location.hash = 'meal-details';

  } catch (error) {
    console.error('Detailed view error:', error);
  } finally {
    if (loadingOverlay) {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
      }, 500);
    }
  }
});

document.addEventListener('click', async (e) => {
  if (e.target.closest('#back-to-meals-btn')) {
    window.location.hash = 'meals';
    return;
  }

  if (e.target.closest('#log-meal-btn')) {
    if (!currentMealData) return;

    const cals = Math.round(currentNutritionData.calories || 0);
    const protein = Math.round(currentNutritionData.protein || 0);
    const carbs = Math.round(currentNutritionData.carbs || 0);
    const fat = Math.round(currentNutritionData.fat || 0);
    const imageUrl = currentMealData.image || currentMealData.thumbnail || currentMealData.strMealThumb || '';

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 opacity-0 transition-opacity duration-300';
    modalOverlay.id = 'logging-modal';

    modalOverlay.innerHTML = `
      <div class="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl transform scale-95 transition-transform duration-300">
        
        <div class="flex items-center gap-4 mb-6">
          <img src="${imageUrl}" class="w-14 h-14 rounded-xl object-cover shadow-sm">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
            <p class="text-gray-500 text-sm">${currentMealData.name}</p>
          </div>
        </div>

        <div class="mb-6">
          <p class="text-sm font-semibold text-gray-700 mb-3">Number of Servings</p>
          <div class="flex items-center gap-3">
            <button id="modal-minus" class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><i class="fa-solid fa-minus"></i></button>
            <input type="number" id="modal-servings" value="1" step="0.5" min="0.5" max="10" class="w-16 h-10 text-center font-bold text-lg border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" readonly>
            <button id="modal-plus" class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"><i class="fa-solid fa-plus"></i></button>
          </div>
        </div>

        <div class="bg-emerald-50 rounded-2xl p-4 mb-6">
          <p class="text-xs text-gray-500 mb-3">Estimated nutrition per serving:</p>
          <div class="flex justify-between text-center">
            <div><p class="font-bold text-emerald-600 text-lg">${cals}</p><p class="text-[10px] text-gray-500">Calories</p></div>
            <div><p class="font-bold text-blue-600 text-lg">${protein}g</p><p class="text-[10px] text-gray-500">Protein</p></div>
            <div><p class="font-bold text-amber-600 text-lg">${carbs}g</p><p class="text-[10px] text-gray-500">Carbs</p></div>
            <div><p class="font-bold text-purple-600 text-lg">${fat}g</p><p class="text-[10px] text-gray-500">Fat</p></div>
          </div>
        </div>

        <div class="flex gap-3">
          <button id="modal-cancel" class="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
          <button id="modal-confirm" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
            <i class="fa-solid fa-clipboard-list"></i> Log Meal
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    requestAnimationFrame(() => {
      modalOverlay.classList.remove('opacity-0');
      modalOverlay.firstElementChild.classList.remove('scale-95');
    });

    let servings = 1;
    const minusBtn = modalOverlay.querySelector('#modal-minus');
    const plusBtn = modalOverlay.querySelector('#modal-plus');
    const input = modalOverlay.querySelector('#modal-servings');

    const updateDisplay = () => {
      input.value = servings;
    };

    minusBtn.addEventListener('click', () => {
      if (servings > 0.5) {
        servings -= 0.5;
        updateDisplay();
      }
    });

    plusBtn.addEventListener('click', () => {
      if (servings < 10) {
        servings += 0.5;
        updateDisplay();
      }
    });

    const closeModal = () => {
      modalOverlay.classList.add('opacity-0');
      modalOverlay.firstElementChild.classList.add('scale-95');
      setTimeout(() => modalOverlay.remove(), 300);
    };

    modalOverlay.querySelector('#modal-cancel').addEventListener('click', closeModal);

    modalOverlay.querySelector('#modal-confirm').addEventListener('click', () => {
      const foodItem = {
        name: currentMealData.name,
        type: 'Recipe',
        servings: servings,
        calories: cals * servings,
        protein: protein * servings,
        carbs: carbs * servings,
        fats: fat * servings,
        image: imageUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      app.addFoodItem(foodItem);
      closeModal();

      Swal.fire({
        html: `
          <div class="flex flex-col items-center justify-center pt-4 pb-2">
            <div class="w-20 h-20 rounded-full border-[3px] border-[#a7f3d0] flex items-center justify-center mb-6">
              <i class="fa-solid fa-check text-4xl text-[#34d399]"></i>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Meal Logged!</h2>
            <p class="text-gray-500 text-sm mb-4">
              ${currentMealData.name} (${servings} serving${servings !== 1 ? 's' : ''}) has been added to your daily log.
            </p>
            <p class="text-emerald-600 font-bold text-lg">+${Math.round(cals * servings)} calories</p>
          </div>
        `,
        showConfirmButton: false,
        timer: 2500,
        customClass: { popup: 'rounded-3xl shadow-xl border-0' }
      });
    });
  }

  if (e.target.closest('.delete-log-btn')) {
    const btn = e.target.closest('.delete-log-btn');
    app.removeFoodItem(btn.dataset.id);
    renderFoodLog(); 
    return;
  }

  if (e.target.closest('#clear-all-log-btn')) {
    app.clearFoodLog();
    renderFoodLog(); 
    return;
  }

  if (e.target.closest('#product-search-btn')) {
    const input = document.getElementById('product-search-input');
    const query = input.value.trim();
    if (!query) return;

    const resultsInfo = document.getElementById('product-results-info');
    const grid = document.getElementById('products-grid');
    
    grid.innerHTML = createLoadingSpinner();
    resultsInfo.textContent = `Searching for "${query}"...`;

    try {
      let products = await searchProducts(query);
      if (!Array.isArray(products) && products.products) products = products.products;
      if (!Array.isArray(products) && products.data) products = products.data;

      if (products && products.length > 0) {
        currentProductsData = products;
        resultsInfo.innerHTML = `Showing results for "<span class="text-gray-900 font-bold">${query}</span>"`;
        grid.innerHTML = products.map((p, i) => createProductCard(p, i)).join(''); 
      } else {
        resultsInfo.textContent = `No products found for "${query}"`;
        grid.innerHTML = createEmptyState('No products found', 'Check the spelling or try a different term.');
      }
    } catch (error) {
      grid.innerHTML = createEmptyState('Error fetching products', 'Please check the console for details.');
    }
    return;
  }

  if (e.target.closest('#barcode-lookup-btn')) {
    const input = document.getElementById('barcode-search-input');
    const barcode = input.value.trim();
    if (!barcode) return;

    const resultsInfo = document.getElementById('product-results-info');
    const grid = document.getElementById('products-grid');
    
    grid.innerHTML = createLoadingSpinner();
    resultsInfo.textContent = `Looking up barcode "${barcode}"...`;

    try {
      const result = await getProductByBarcode(barcode);
      const product = result?.product || result?.data || result; 
      
      if (product && (product.product_name || product.name)) {
        currentProductsData = [product];
        resultsInfo.innerHTML = `Found 1 result for barcode "<span class="text-gray-900 font-bold">${barcode}</span>"`;
        grid.innerHTML = createProductCard(product, 0);
      } else {
        resultsInfo.textContent = `No product found for barcode "${barcode}"`;
        grid.innerHTML = createEmptyState('Barcode not recognized', 'Ensure the numbers are correct.');
      }
    } catch (error) {
      grid.innerHTML = createEmptyState('Error fetching barcode', 'Please try again later.');
    }
    return;
  }

  if (e.target.closest('.product-card')) {
    const card = e.target.closest('.product-card');
    const barcode = card.dataset.barcode;
    const cardName = card.querySelector('h3')?.textContent;
    
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
      loadingOverlay.style.opacity = '1';
    }

    try {
      let cachedProduct = currentProductsData.find(p => String(p.code || p._id || p.id || p.barcode) === String(barcode));
      if (!cachedProduct && cardName) {
         cachedProduct = currentProductsData.find(p => (p.product_name || p.name) === cardName);
      }
      cachedProduct = cachedProduct || {};

      let fullProduct = {};
      if (barcode && barcode !== 'undefined') {
         try {
           const result = await getProductByBarcode(barcode);
           if (result && !result.error && !result.message) {
              fullProduct = result.product || result.data || result || {};
           }
         } catch(err) {
           console.warn('Barcode fetch skipped'); 
         }
      }

      const product = { ...cachedProduct, ...fullProduct };

      if (Object.keys(product).length === 0) throw new Error('Product entirely missing');

      const name = product.product_name || product.name || cardName || 'Unknown Product';
      const brand = product.brands || product.brand || 'Unknown Brand';
      const image = product.image_front_url || product.image_url || product.image || 'https://via.placeholder.com/150';
      const quantity = product.quantity || '-';
      
      let ingredients = product.ingredients_text || product.ingredients || 'No ingredients information available.';
      if (Array.isArray(ingredients)) ingredients = ingredients.map(i => i.text || i).join(', ');

      const rawScore = product.nutriscore_grade || product.nutrition_grades || product.nutrition_grade_fr || product.nutrition_grades_tags?.[0] || 'UNKNOWN';
      const nutriScore = String(rawScore).toUpperCase();
      const nova = product.nova_group || product.nova || '';

      const n = product.nutrition || product.nutriments || product.nutrients || product.data?.perServing || product.perServing || product || {};
      const safeNum = (val) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
      
      const cals = Math.round(n.calories || n.energy || n['energy-kcal_100g'] || n['energy-kcal'] || n.ENERC_KCAL || 0);
      const protein = safeNum(n.protein || n.proteins || n.proteins_100g || n.PROCNT).toFixed(1);
      const carbs = safeNum(n.carbs || n.carbohydrates || n.carbohydrates_100g || n.CHOCDF).toFixed(1);
      const fat = safeNum(n.fat || n.fats || n.fat_100g || n.FAT).toFixed(1);
      const sugar = safeNum(n.sugar || n.sugars || n.sugars_100g || n.SUGAR).toFixed(1);
      const satFat = safeNum(n.saturated_fat || n.saturatedFat || n['saturated-fat_100g'] || n.FASAT).toFixed(1);
      const fiber = safeNum(n.fiber || n.fiber_100g || n.FIBTG).toFixed(1);
      const salt = safeNum(n.salt || n.sodium || n.salt_100g || n.NA).toFixed(2);

      const scoreBg = {'A': '#008b4c', 'B': '#80c342', 'C': '#feca0b', 'D': '#f58220', 'E': '#ef3e22'}[nutriScore] || '#9ca3af';
      const scoreLabel = {'A': 'Excellent', 'B': 'Good', 'C': 'Average', 'D': 'Poor', 'E': 'Terrible'}[nutriScore] || 'Unknown';
      const novaBg = {'1': '#00ca79', '2': '#ffc107', '3': '#fd7e14', '4': '#ef3e22'}[nova] || '#9ca3af';
      const novaLabel = {'1': 'Unprocessed', '2': 'Processed ingredients', '3': 'Processed', '4': 'Ultra-processed'}[nova] || 'Unknown';

      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 opacity-0 transition-opacity duration-300';
      modalOverlay.id = 'product-details-modal';

      modalOverlay.innerHTML = `
        <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform scale-95 transition-transform duration-300 relative">
          <button id="close-product-modal-top" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fa-solid fa-xmark text-2xl"></i>
          </button>

          <div class="p-8">
            <div class="flex gap-6 mb-8">
              <div style="width: 100px; height: 130px; flex-shrink: 0; border-radius: 0.75rem; background-color: #f9fafb; display: flex; align-items: center; justify-content: center; padding: 0.5rem; border: 1px solid #f3f4f6; overflow: hidden;">
                <img src="${image}" style="max-width: 100%; max-height: 100%; object-fit: contain; mix-blend-mode: multiply;">
              </div>
              
              <div>
                <p class="text-sm font-bold text-emerald-600 mb-1 truncate max-w-[300px]">${brand}</p>
                <h2 class="text-2xl font-bold text-gray-900 leading-tight mb-2">${name}</h2>
                <p class="text-gray-500 text-sm mb-4">${quantity}</p>

                <div class="flex flex-wrap gap-3">
                  ${nutriScore !== 'UNKNOWN' ? `
                  <div class="flex items-center gap-2 bg-yellow-50 pr-3 rounded-lg border border-yellow-100">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black" style="background-color: ${scoreBg}">${nutriScore}</div>
                    <div><p class="text-[10px] font-bold text-yellow-700 leading-none">Nutri-Score</p><p class="text-[10px] text-yellow-600">${scoreLabel}</p></div>
                  </div>` : ''}

                  ${nova ? `
                  <div class="flex items-center gap-2 bg-red-50 pr-3 rounded-lg border border-red-100">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black" style="background-color: ${novaBg}">${nova}</div>
                    <div><p class="text-[10px] font-bold text-red-700 leading-none">NOVA</p><p class="text-[10px] text-red-600">${novaLabel}</p></div>
                  </div>` : ''}
                </div>
              </div>
            </div>

            <div class="bg-[#f0fdf4] border border-emerald-100 rounded-2xl p-6 mb-6">
              <h3 class="font-bold text-gray-900 flex items-center gap-2 mb-6">
                <i class="fa-solid fa-chart-pie text-emerald-600"></i> Nutrition Facts <span class="text-gray-400 font-normal text-sm">(per 100g)</span>
              </h3>

              <div class="text-center mb-6">
                <p class="text-4xl font-bold text-gray-900">${cals}</p>
                <p class="text-gray-500 text-sm">Calories</p>
              </div>

              <div class="flex items-center justify-between gap-2 mb-6">
                <div class="flex-1 text-center">
                  <div class="w-full h-1 bg-gray-200 rounded-full mb-2 relative overflow-hidden"><div class="absolute left-0 top-0 h-full bg-emerald-500 w-1/2"></div></div>
                  <p class="font-bold text-emerald-600 text-lg leading-none">${protein}g</p>
                  <p class="text-xs text-gray-500 mt-1">Protein</p>
                </div>
                <div class="flex-1 text-center">
                  <div class="w-full h-1 bg-gray-200 rounded-full mb-2 relative overflow-hidden"><div class="absolute left-0 top-0 h-full bg-blue-500 w-1/2"></div></div>
                  <p class="font-bold text-blue-600 text-lg leading-none">${carbs}g</p>
                  <p class="text-xs text-gray-500 mt-1">Carbs</p>
                </div>
                <div class="flex-1 text-center">
                  <div class="w-full h-1 bg-gray-200 rounded-full mb-2 relative overflow-hidden"><div class="absolute left-0 top-0 h-full bg-purple-500 w-1/2"></div></div>
                  <p class="font-bold text-purple-600 text-lg leading-none">${fat}g</p>
                  <p class="text-xs text-gray-500 mt-1">Fat</p>
                </div>
                <div class="flex-1 text-center">
                  <div class="w-full h-1 bg-gray-200 rounded-full mb-2 relative overflow-hidden"><div class="absolute left-0 top-0 h-full bg-orange-500 w-1/2"></div></div>
                  <p class="font-bold text-orange-600 text-lg leading-none">${sugar}g</p>
                  <p class="text-xs text-gray-500 mt-1">Sugar</p>
                </div>
              </div>

              <div class="flex justify-between border-t border-emerald-200/50 pt-4 text-center">
                <div class="flex-1"><p class="font-bold text-gray-900">${satFat}g</p><p class="text-xs text-gray-500">Saturated Fat</p></div>
                <div class="flex-1"><p class="font-bold text-gray-900">${fiber}g</p><p class="text-xs text-gray-500">Fiber</p></div>
                <div class="flex-1"><p class="font-bold text-gray-900">${salt}g</p><p class="text-xs text-gray-500">Salt</p></div>
              </div>
            </div>

            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
              <h3 class="font-bold text-gray-900 flex items-center gap-2 mb-3">
                <i class="fa-solid fa-list-ul text-gray-800"></i> Ingredients
              </h3>
              <p class="text-gray-600 text-sm leading-relaxed capitalize">${ingredients}</p>
            </div>

            <div class="flex gap-4">
              <button id="log-product-btn" class="flex-1 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm" style="background-color: #009b70;" onmouseover="this.style.backgroundColor='#047857'" onmouseout="this.style.backgroundColor='#009b70'">
                <i class="fa-solid fa-plus"></i> Log This Food
              </button>
              <button id="close-product-btn" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modalOverlay);

      requestAnimationFrame(() => {
        modalOverlay.classList.remove('opacity-0');
        modalOverlay.firstElementChild.classList.remove('scale-95');
      });

      const closeModal = () => {
        modalOverlay.classList.add('opacity-0');
        modalOverlay.firstElementChild.classList.add('scale-95');
        setTimeout(() => modalOverlay.remove(), 300);
      };

      modalOverlay.querySelector('#close-product-modal-top').addEventListener('click', closeModal);
      modalOverlay.querySelector('#close-product-btn').addEventListener('click', closeModal);

      modalOverlay.querySelector('#log-product-btn').addEventListener('click', () => {
        const foodItem = {
          name: name,
          type: 'Product',
          servings: 1, 
          calories: cals,
          protein: parseFloat(protein),
          carbs: parseFloat(carbs),
          fats: parseFloat(fat),
          image: image,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        app.addFoodItem(foodItem);
        closeModal();

        Swal.fire({
          html: `
            <div class="flex flex-col items-center justify-center pt-4 pb-2">
              <div class="w-20 h-20 rounded-full border-[3px] border-[#a7f3d0] flex items-center justify-center mb-6">
                <i class="fa-solid fa-check text-4xl text-[#34d399]"></i>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Product Logged!</h2>
              <p class="text-gray-500 text-sm mb-4 text-center">${name} has been added to your daily log.</p>
              <p class="text-emerald-600 font-bold text-lg">+${cals} calories</p>
            </div>
          `,
          showConfirmButton: false,
          timer: 2500,
          customClass: { popup: 'rounded-3xl shadow-xl border-0' }
        });
      });

    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => { if (loadingOverlay) loadingOverlay.style.display = 'none'; }, 500);
      }
    }
    return;
  }
});

document.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    if (e.target.id === 'product-search-input') {
      document.getElementById('product-search-btn').click();
    } else if (e.target.id === 'barcode-search-input') {
      document.getElementById('barcode-lookup-btn').click();
    }
  }
});

const init = () => {
  handleRoute();
  loadInitialData();
};

document.addEventListener('DOMContentLoaded', init);

