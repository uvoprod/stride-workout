// FOOD LOGGER config — edit freely.

// Models the AI estimator can use (ids from the Claude API).
export const models = [
  { id: 'claude-haiku-5-5', label: 'Haiku 5.5 · fast and cheap' },
  { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5 · more accurate, better with photos' },
];

// Daily target maths. Kept deliberately gentle for a growing teenager.
export const targets = {
  activity: 1.45,       // multiplier on BMR for 3 gym sessions + steps
  deficitDefault: 400,  // kcal below estimated maintenance
  deficitMin: 200,
  deficitMax: 500,      // capped: bigger deficits are not recommended for teens
  proteinPerKg: 1.4,    // grams of protein per kg body weight
};

export const SYSTEM_PROMPT = `You are a careful nutrition estimator for a teenager who eats a lot of Indian home food, street food, restaurant food and random snacks.
Given a description and/or photo of a meal, estimate calories and macros for what was actually eaten.
Rules:
- Use realistic portions. A katori is about 150 ml. A medium roti is about 40 g. A plate of rice is about 250 g cooked.
- Indian home cooking uses oil or ghee; assume a typical amount unless told otherwise. Restaurant and street food usually has more oil, butter and cream, so estimate higher.
- If the portion is unclear, assume a typical single serving and say so in "note".
- Split the meal into separate items when it makes sense (e.g. roti, dal, sabzi).
- Be honest about uncertainty with "confidence": "high", "medium" or "low".
Reply with ONLY valid JSON, no markdown, in exactly this shape:
{"items":[{"name":"string","portion":"string","kcal":number,"protein":number,"carbs":number,"fat":number,"confidence":"high|medium|low","note":"short string"}]}
All numbers are for the portion eaten, protein/carbs/fat in grams, kcal as a whole number.`;

// Quick-add database: [name, serving, kcal, protein g, carbs g, fat g]. Approximate, typical servings.
const F = (name, unit, k, p, c, f) => ({ name, unit, kcal: k, protein: p, carbs: c, fat: f });
export const foods = [
  F('Roti / chapati', '1 medium', 100, 3, 18, 2), F('Roti with ghee', '1 medium', 130, 3, 18, 5), F('Plain paratha', '1', 260, 5, 34, 11),
  F('Aloo paratha', '1', 300, 6, 40, 12), F('Puri', '1', 120, 2, 14, 6), F('Thepla', '1', 130, 3, 17, 5), F('Naan', '1', 260, 8, 45, 5), F('Butter naan', '1', 320, 8, 45, 11),
  F('Steamed rice', '1 katori (150 g)', 200, 4, 44, 0.5), F('Jeera rice', '1 katori', 230, 4, 44, 4), F('Khichdi', '1 katori', 180, 6, 30, 4),
  F('Dal tadka', '1 katori', 160, 8, 20, 5), F('Moong dal', '1 katori', 130, 8, 18, 3), F('Rajma', '1 katori', 200, 9, 28, 6), F('Chole', '1 katori', 230, 10, 30, 8), F('Kadhi', '1 katori', 150, 5, 14, 8), F('Sambar', '1 katori', 100, 5, 14, 3),
  F('Paneer butter masala', '1 katori', 340, 12, 10, 28), F('Palak paneer', '1 katori', 250, 12, 9, 18), F('Matar paneer', '1 katori', 250, 11, 14, 16), F('Paneer bhurji', '100 g', 250, 15, 6, 19),
  F('Aloo gobi', '1 katori', 150, 3, 17, 8), F('Bhindi masala', '1 katori', 120, 3, 10, 8), F('Mixed veg sabzi', '1 katori', 110, 3, 12, 6), F('Baingan bharta', '1 katori', 130, 3, 10, 9),
  F('Chicken curry', '1 katori + 2 pcs', 280, 22, 6, 18), F('Butter chicken', '1 katori', 350, 24, 10, 24), F('Mutton curry', '1 katori', 350, 24, 5, 26), F('Fish curry', '1 katori', 220, 20, 5, 13),
  F('Chicken biryani', '1 plate (300 g)', 550, 25, 70, 18), F('Veg biryani', '1 plate', 450, 9, 70, 14), F('Egg biryani', '1 plate', 500, 18, 68, 16),
  F('Chicken tikka', '4 pieces', 200, 28, 4, 8), F('Tandoori chicken', '2 pieces', 300, 34, 4, 16), F('Chicken breast (grilled/boiled)', '100 g', 165, 31, 0, 4),
  F('Boiled egg', '1', 75, 6, 0.6, 5), F('Omelette (2 eggs)', '2 eggs', 200, 13, 1, 15), F('Egg bhurji (2 eggs)', '2 eggs', 230, 13, 4, 17),
  F('Idli', '1', 60, 2, 12, 0.3), F('Plain dosa', '1', 130, 3, 22, 3), F('Masala dosa', '1', 250, 5, 38, 8), F('Coconut chutney', '2 tbsp', 50, 1, 3, 4), F('Upma', '1 katori', 200, 4, 30, 7), F('Poha', '1 plate', 250, 5, 40, 8),
  F('Samosa', '1', 260, 4, 28, 15), F('Kachori', '1', 250, 5, 26, 14), F('Vada pav', '1', 290, 7, 40, 11), F('Pav bhaji', '1 plate', 550, 12, 70, 24), F('Pani puri', '6 pieces', 200, 3, 30, 8), F('Bhel puri', '1 plate', 250, 5, 40, 8),
  F('Pakora / bhajiya', '4 pieces', 250, 5, 22, 16), F('Aloo tikki', '1', 120, 2, 16, 6), F('Maggi (cooked)', '1 pack', 350, 8, 48, 14), F('Veg sandwich (grilled)', '1', 280, 8, 36, 11),
  F('Fried rice', '1 plate', 450, 10, 65, 16), F('Hakka noodles / chowmein', '1 plate', 450, 10, 62, 16), F('Veg momos', '6 pieces', 250, 7, 40, 6), F('Chicken momos', '6 pieces', 300, 16, 36, 9), F('Pizza', '1 slice', 285, 12, 36, 10), F('Burger', '1', 350, 15, 33, 17), F('French fries', 'medium', 365, 4, 48, 17),
  F('Curd / dahi', '1 katori', 70, 4, 5, 4), F('Chaas / buttermilk', '1 glass', 40, 2, 4, 1.5), F('Sweet lassi', '1 glass', 200, 6, 30, 6), F('Milk (full fat)', '1 glass (250 ml)', 150, 8, 12, 8), F('Chai with milk and sugar', '1 cup', 90, 2, 12, 3), F('Coconut water', '1 glass', 45, 0.5, 10, 0), F('Fruit juice', '1 glass', 110, 1, 26, 0), F('Cola', '1 can (330 ml)', 140, 0, 35, 0),
  F('Banana', '1', 105, 1, 27, 0.4), F('Apple', '1', 80, 0.4, 21, 0.3), F('Mango', '1 medium', 200, 2, 50, 1), F('Sprouts salad', '1 katori', 100, 7, 15, 1), F('Cucumber / kachumber salad', '1 plate', 30, 1, 6, 0.3),
  F('Peanuts', '30 g', 170, 8, 5, 14), F('Almonds', '10', 70, 3, 2.5, 6), F('Peanut butter', '1 tbsp', 95, 4, 3, 8), F('Roasted chana', '30 g', 110, 6, 18, 2), F('Soya chunks (cooked)', '1 katori', 130, 16, 8, 0.5), F('Whey protein', '1 scoop', 120, 24, 3, 1.5), F('Oats with milk', '1 bowl', 250, 11, 35, 8),
  F('Bread', '1 slice', 75, 2.5, 14, 1), F('Butter', '1 tsp', 35, 0, 0, 4), F('Ghee', '1 tsp', 45, 0, 0, 5),
  F('Parle-G biscuits', '4 pieces', 130, 2, 22, 4), F('Namkeen / bhujia', '30 g', 160, 4, 14, 10), F('Potato chips', 'small pack (30 g)', 160, 2, 16, 10),
  F('Gulab jamun', '1', 150, 2, 22, 6), F('Jalebi', '50 g', 180, 1, 30, 7), F('Rasgulla', '1', 120, 3, 25, 1), F('Ladoo', '1', 180, 3, 24, 8), F('Kheer', '1 katori', 220, 6, 32, 7), F('Halwa', '1 katori', 300, 4, 40, 14),
];
