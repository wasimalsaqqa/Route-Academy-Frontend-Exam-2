const BASE_URL = 'https://nutriplan-api.vercel.app/api';
const USDA_API_KEY = 'rZtZs2LlcSgbh7opLqTPUtmgXyereSCAwkdtiwgA';

export const searchMeals = async (query = '', page = 1, limit = 25) => {

  try{
    const response = await fetch(`${BASE_URL}/meals/search?q=${query}&page=${page}&limit=${limit}`);
    if(!response.ok) 
        throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log('Meals Search Response:', data);
    return data.meals || data.data || data.results || data.items || []; 
  }
  catch(error){
    console.error('Error searching meals:', error);
    return [];
  }
};

export const getMealById = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/meals/${id}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    
    return data.meal || data.data || data.result || data;
  } catch (error) {
    console.error(`Error fetching meal details for ID ${id}:`, error);
    return null;
  }
};

export const fetchCategories = async () => {

  try{
    const response = await fetch(`${BASE_URL}/meals/categories`);
    if(!response.ok) 
        throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log('Categories Response:', data);
    return data.categories || data.data || data.results || [];
  }
  catch(error){
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const analyzeRecipeNutrition = async(recipeName, ingredientsArray) => {

  try{
    const response = await fetch(`${BASE_URL}/nutrition/analyze`,{
      method: 'POST',
      headers:{
        'Content-Type': 'application/json',
        'x-api-key': USDA_API_KEY
      },
      body: JSON.stringify({
        recipeName: recipeName,
        ingredients: ingredientsArray
      })
    });
    
    if(!response.ok) 
        throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  }
  catch(error){
    console.error('Error analyzing nutrition:', error);
    return null;
  }
};

export const searchProducts = async(query, page=1, limit=24) => {
  try {
    const response = await fetch(`${BASE_URL}/products/search?q=${query}&page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    return data.products || data.data || data.results || data.items || (Array.isArray(data) ? data : []);
  } catch(error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const getProductByBarcode = async(barcode) => {
  try {
    const response = await fetch(`${BASE_URL}/products/barcode/${barcode}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();

    return data.product || data.data || data;
  } catch(error) {
    console.error(`Error fetching product with barcode ${barcode}:`, error);
    return null;
  }
};

export const getProductCategories = async() => {

  try{
    const response = await fetch(`${BASE_URL}/products/categories`);
    if(!response.ok) 
        throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.categories || [];
  }
  catch(error){
    console.error('Error fetching product categories:', error);
    return [];
  }
};

export const getProductsByCategory = async(category) => {

  try{
    const response = await fetch(`${BASE_URL}/products/category/${category}`);
    if(!response.ok) 
        throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.products || [];
  }
  catch(error){
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
};

export const fetchAreas = async () => {
  try {
    const response = await fetch(`${BASE_URL}/meals/areas`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.areas || data.data || data.results || [];
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
};

