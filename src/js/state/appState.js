export class AppState {
  constructor() {
    this.currentPage = 'meals'; 
    this.foodLog = this.loadFoodLog();
    this.dailyGoals = {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fats: 70
    };
  }
  
  setCurrentPage(page) {
    this.currentPage = page;
  }
  
  getCurrentPage() {
    return this.currentPage;
  }
  
  loadFoodLog() {
    try {
      const log = localStorage.getItem('nutriplan_foodlog');
      return log ? JSON.parse(log) : [];
    } catch (error) {
      console.error('Failed to load food log from localStorage:', error);
      return [];
    }
  }

  saveFoodLog() {
    try {
      localStorage.setItem('nutriplan_foodlog', JSON.stringify(this.foodLog));
    } catch (error) {
      console.error('Failed to save food log to localStorage:', error);
    }
  }

  addFoodItem(item) {
    const newItem = {
      ...item,
      logId: Date.now().toString(),
      date: new Date().toLocaleDateString()
    };
    
    this.foodLog.push(newItem);
    this.saveFoodLog();
  }

  removeFoodItem(logId) {
    this.foodLog = this.foodLog.filter(item => item.logId !== logId);
    this.saveFoodLog();
  }

  clearFoodLog() {
    this.foodLog = [];
    this.saveFoodLog();
  }

  getTodayLog() {
    const today = new Date().toLocaleDateString();
    return this.foodLog.filter(item => item.date === today);
  }

  getTodayTotals() {
    const todayLog = this.getTodayLog();
    
    return todayLog.reduce((totals, item) => {
      totals.calories += (parseFloat(item.calories) || 0);
      totals.protein += (parseFloat(item.protein) || 0);
      totals.carbs += (parseFloat(item.carbs) || 0);
      totals.fats += (parseFloat(item.fats) || 0);
      
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }
}