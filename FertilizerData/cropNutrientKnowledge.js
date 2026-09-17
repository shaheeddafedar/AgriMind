const cropNutrientKnowledge = {

    // Cereals & Millets
    Rice: { category: "Cereal", nitrogen: "high", phosphorus: "medium", potassium: "medium" },
    Wheat: { category: "Cereal", nitrogen: "high", phosphorus: "medium", potassium: "medium" },
    Maize: { category: "Cereal", nitrogen: "high", phosphorus: "medium", potassium: "medium" },
    Barley: { category: "Cereal", nitrogen: "medium", phosphorus: "medium", potassium: "medium" },
    Ragi: { category: "Millet", nitrogen: "medium", phosphorus: "medium", potassium: "medium" },
    Sorghum: { category: "Millet", nitrogen: "medium", phosphorus: "medium", potassium: "medium" },
    Sugarcane: { category: "Commercial", nitrogen: "high", phosphorus: "high", potassium: "high" },
    
    // Pulses & Legumes
    Blackgram: { category: "Pulse", nitrogen: "low", phosphorus: "high", potassium: "medium" },
    Chickpea: { category: "Pulse", nitrogen: "low", phosphorus: "high", potassium: "medium" },
    Horsegram: { category: "Pulse", nitrogen: "low", phosphorus: "medium", potassium: "low" },
    Kidneybeans: { category: "Pulse", nitrogen: "medium", phosphorus: "high", potassium: "medium" },
    Lentil: { category: "Pulse", nitrogen: "low", phosphorus: "high", potassium: "medium" },
    Mothbeans: { category: "Pulse", nitrogen: "low", phosphorus: "medium", potassium: "low" },
    Mungbean: { category: "Pulse", nitrogen: "low", phosphorus: "high", potassium: "medium" },
    Pigeonpeas: { category: "Pulse", nitrogen: "low", phosphorus: "high", potassium: "medium" },
    Soybean: { category: "Legume", nitrogen: "medium", phosphorus: "high", potassium: "medium" },

    // Vegetables
    Brinjal: { category: "Vegetable", nitrogen: "high", phosphorus: "high", potassium: "high" },
    Cabbage: { category: "Vegetable", nitrogen: "high", phosphorus: "high", potassium: "high" },
    Cauliflower: { category: "Vegetable", nitrogen: "high", phosphorus: "high", potassium: "high" },
    Garlic: { category: "Vegetable", nitrogen: "medium", phosphorus: "high", potassium: "medium" },
    Okra: { category: "Vegetable", nitrogen: "high", phosphorus: "medium", potassium: "medium" },
    Onion: { category: "Vegetable", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Potato: { category: "Vegetable", nitrogen: "medium", phosphorus: "high", potassium: "high" },
    Sweet_Potato: { category: "Vegetable", nitrogen: "low", phosphorus: "medium", potassium: "high" },
    Tomato: { category: "Vegetable", nitrogen: "high", phosphorus: "high", potassium: "high" },

    // Fruits
    Apple: { category: "Fruit", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Banana: { category: "Fruit", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Coconut: { category: "Plantation", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Grapes: { category: "Fruit", nitrogen: "high", phosphorus: "high", potassium: "high" },
    Mango: { category: "Fruit", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Muskmelon: { category: "Fruit", nitrogen: "medium", phosphorus: "high", potassium: "high" },
    Orange: { category: "Fruit", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Papaya: { category: "Fruit", nitrogen: "high", phosphorus: "high", potassium: "high" },
    Pomegranate: { category: "Fruit", nitrogen: "high", phosphorus: "high", potassium: "high" },
    Watermelon: { category: "Fruit", nitrogen: "medium", phosphorus: "high", potassium: "high" },

    // Oil & Commercial Crops
    Cotton: { category: "Commercial", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Jute: { category: "Commercial", nitrogen: "high", phosphorus: "medium", potassium: "medium" },
    Rapeseed: { category: "Oilseed", nitrogen: "high", phosphorus: "high", potassium: "medium" },
    Sunflower: { category: "Oilseed", nitrogen: "high", phosphorus: "high", potassium: "high" },

    // Spices & Plantation Crops
    Black_Pepper: { category: "Spice", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Cardamom: { category: "Spice", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Coriander: { category: "Spice", nitrogen: "medium", phosphorus: "medium", potassium: "medium" },
    Turmeric: { category: "Spice", nitrogen: "high", phosphorus: "medium", potassium: "high" },
    Coffee: { category: "Plantation", nitrogen: "high", phosphorus: "medium", potassium: "high" }
};

module.exports = cropNutrientKnowledge;