export const planTemplates = {
    NONE: {
        name: "Free Plan",
        description: "Basic access with limited features",
        price: 0.0,
        billingCycle: "MONTHLY",
        features: [
            "🌿 Monitor up to 2 plants",
            "💧 Basic humidity tracking",
            "📊 Limited reports",
        ],
    },
    BASIC: {
        name: "Basic Plan",
        description: "Great for small collections of plants",
        price: 25.0,
        billingCycle: "MONTHLY",
        features: [
            "🌿 Up to 10 plants",
            "💧 Advanced humidity tracking",
            "📅 Watering reminders",
            "📈 Weekly reports",
        ],
    },
    PREMIUM: {
        name: "Premium Plan",
        description: "Unlimited plants and advanced monitoring",
        price: 50.0,
        billingCycle: "MONTHLY",
        features: [
            "🌿 Unlimited plants",
            "💧 Real-time IoT data",
            "📅 Custom watering schedules",
            "🎧 Priority support",
        ],
    },
} as const;

export type PlanType = keyof typeof planTemplates;
