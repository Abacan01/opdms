import { useQuery } from "@tanstack/react-query";

export interface Article {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  readTime: string;
  imageKeyword?: string;
}

export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    title: "10 Habits for a Healthy Heart",
    category: "Heart Health",
    summary: "Discover daily routines that can significantly reduce your risk of cardiovascular diseases and keep your heart strong.",
    content: `Heart disease is the leading cause of death worldwide, but many cardiovascular conditions are preventable through lifestyle changes.

**Regular Exercise**
Aim for at least 150 minutes of moderate-intensity exercise per week. Activities like walking, cycling, and swimming strengthen the heart muscle and improve circulation.

**Heart-Healthy Diet**
Consume a diet rich in fruits, vegetables, whole grains, and lean proteins. Limit saturated fats, trans fats, sodium, and added sugars. The Mediterranean diet has been shown to significantly reduce heart disease risk.

**Quit Smoking**
Smoking is one of the leading causes of cardiovascular disease. Quitting smoking dramatically reduces your risk of heart attack and stroke within just a few years.

**Manage Stress**
Chronic stress contributes to heart disease. Practice relaxation techniques such as meditation, deep breathing, yoga, or spending time in nature.

**Regular Check-ups**
Monitor your blood pressure, cholesterol, and blood sugar regularly. Early detection allows for timely intervention before problems worsen.

**Maintain Healthy Weight**
Excess weight puts extra strain on the heart. Even modest weight loss of 5-10% can significantly improve cardiovascular health.

**Limit Alcohol**
Excessive alcohol consumption can raise blood pressure and contribute to heart failure. If you drink, do so in moderation.

**Quality Sleep**
Poor sleep is linked to increased risk of heart disease. Aim for 7-9 hours of quality sleep per night.

**Stay Hydrated**
Proper hydration helps the heart pump blood more efficiently. Drink at least 8 glasses of water daily.

**Social Connection**
Strong social ties and emotional support have been shown to protect heart health and improve overall well-being.`,
    readTime: "5 min read",
    imageKeyword: "heart"
  },
  {
    id: 2,
    title: "Understanding Physical Therapy",
    category: "Preventive Care",
    summary: "How physical therapy helps you recover from injury and prevent future mobility issues through targeted exercises.",
    content: `Physical therapy is a healthcare profession that helps people improve movement, manage pain, and restore function after injury or illness.

**What is Physical Therapy?**
Physical therapists (PTs) are licensed healthcare professionals who diagnose and treat individuals of all ages who have medical problems or other health-related conditions that limit their ability to move and perform functional activities.

**Benefits of Physical Therapy**
- Pain management without medication
- Improved mobility and strength
- Recovery from injury or surgery
- Prevention of further injury
- Improved balance and coordination
- Management of chronic conditions

**Common Conditions Treated**
Physical therapy is effective for a wide range of conditions including:
- Back and neck pain
- Sports injuries
- Post-surgical rehabilitation
- Arthritis and joint problems
- Neurological conditions like stroke recovery
- Balance disorders

**What to Expect**
Your first visit typically involves a comprehensive evaluation where the therapist assesses your condition, discusses your goals, and develops a personalized treatment plan. Treatment sessions may include:
- Therapeutic exercises
- Manual therapy
- Heat/cold therapy
- Electrical stimulation
- Ultrasound therapy
- Patient education

**Home Exercise Programs**
PTs typically provide home exercise programs to complement clinic sessions and maintain progress between appointments.`,
    readTime: "4 min read",
    imageKeyword: "therapy"
  },
  {
    id: 3,
    title: "Nutrition Essentials for Immunity",
    category: "Nutrition",
    summary: "Foods to incorporate into your diet to build a strong immune system and protect against illness year-round.",
    content: `Your immune system is your body's first line of defense against infections and diseases. What you eat plays a crucial role in how well it functions.

**Vitamin C Rich Foods**
Vitamin C is a powerful antioxidant that supports immune function. Include citrus fruits, bell peppers, strawberries, broccoli, and kiwi in your diet.

**Zinc Sources**
Zinc is essential for immune cell development. Good sources include lean meats, seafood, legumes, seeds, and whole grains.

**Probiotics**
Gut health is closely linked to immune function. Yogurt, kefir, sauerkraut, and other fermented foods support beneficial gut bacteria.

**Vitamin D**
Often called the "sunshine vitamin," vitamin D is crucial for immune regulation. Sources include fatty fish, egg yolks, fortified foods, and sunlight exposure.

**Antioxidant-Rich Foods**
Berries, leafy greens, nuts, and colorful vegetables contain powerful antioxidants that protect cells from damage.

**Omega-3 Fatty Acids**
Found in fatty fish, flaxseeds, and walnuts, omega-3s help regulate the immune response and reduce inflammation.

**Hydration**
Adequate water intake is essential for every bodily function, including immune response. Aim for 8-10 glasses daily.

**Foods to Limit**
- Excessive sugar suppresses immune function
- Processed foods lack nutrients
- Excessive alcohol impairs immune response

**Sample Immune-Boosting Meal**
Start your day with yogurt topped with berries and a glass of orange juice. Have a salad with salmon, spinach, and walnuts for lunch. Dinner could feature chicken soup with plenty of vegetables.`,
    readTime: "6 min read",
    imageKeyword: "nutrition"
  },
  {
    id: 4,
    title: "Managing Stress for Better Mental Health",
    category: "Mental Health",
    summary: "Evidence-based strategies to manage chronic stress and protect both your mental and physical health.",
    content: `Stress is a normal part of life, but when it becomes chronic, it can have serious consequences for both mental and physical health.

**Understanding the Stress Response**
When you encounter a stressor, your body releases cortisol and adrenaline, preparing you for "fight or flight." While helpful in short bursts, chronic stress keeps these hormones elevated, leading to health problems.

**Health Impacts of Chronic Stress**
- Increased risk of heart disease
- Weakened immune system
- Sleep disorders
- Anxiety and depression
- Digestive problems
- Weight gain

**Proven Stress Management Techniques**

*Mindfulness Meditation*
Regular mindfulness practice has been shown to reduce stress, anxiety, and depression. Even 10-15 minutes daily can make a significant difference.

*Physical Exercise*
Exercise releases endorphins and reduces stress hormones. Any form of physical activity—walking, dancing, yoga—can help.

*Deep Breathing*
The 4-7-8 breathing technique: inhale for 4 seconds, hold for 7, exhale for 8. This activates the parasympathetic nervous system.

*Social Support*
Strong relationships buffer the effects of stress. Talk to friends, family, or a counselor about what you're going through.

*Time Management*
Poor time management often leads to stress. Prioritize tasks, set realistic goals, and learn to say no.

*Sleep Hygiene*
Adequate sleep is essential for stress management. Create a consistent bedtime routine and optimize your sleep environment.

**When to Seek Professional Help**
If stress is significantly impacting your daily life, relationships, or work, consider speaking with a mental health professional.`,
    readTime: "7 min read",
    imageKeyword: "mental health"
  },
  {
    id: 5,
    title: "Blood Pressure: Understanding the Silent Killer",
    category: "Heart Health",
    summary: "What you need to know about high blood pressure, its risks, and how to keep it under control naturally.",
    content: `High blood pressure (hypertension) affects millions of people worldwide and is often called the "silent killer" because it rarely causes symptoms until serious damage has occurred.

**Understanding Blood Pressure Numbers**
Blood pressure is measured in millimeters of mercury (mmHg) and recorded as two numbers:
- Systolic (top number): Pressure when heart beats
- Diastolic (bottom number): Pressure when heart rests

**Blood Pressure Categories**
- Normal: Below 120/80 mmHg
- Elevated: 120-129/<80 mmHg
- High Stage 1: 130-139/80-89 mmHg
- High Stage 2: 140+/90+ mmHg
- Crisis: 180+/120+ mmHg

**Risk Factors**
- Family history
- Age (risk increases with age)
- Being overweight
- Physical inactivity
- Tobacco use
- High salt diet
- Alcohol consumption
- Stress

**Lifestyle Changes to Lower Blood Pressure**
The DASH diet (Dietary Approaches to Stop Hypertension) specifically targets blood pressure reduction. Key strategies include reducing sodium intake, increasing potassium-rich foods, regular exercise, limiting alcohol, and quitting smoking.

**Monitoring at Home**
Home blood pressure monitoring can provide valuable information to your doctor and help you track the effectiveness of lifestyle changes or medications.`,
    readTime: "8 min read",
    imageKeyword: "blood pressure"
  },
  {
    id: 6,
    title: "COVID-19 Vaccination: What You Need to Know",
    category: "Preventive Care",
    summary: "Stay informed about COVID-19 vaccines, their effectiveness, and the importance of staying up to date with boosters.",
    content: `Vaccination remains one of the most effective tools we have to protect against COVID-19 and its variants.

**How COVID-19 Vaccines Work**
COVID-19 vaccines teach your immune system to recognize and fight the virus. Different types of vaccines use different methods, but all help your immune system build protection.

**Types of COVID-19 Vaccines**
- mRNA vaccines (Pfizer-BioNTech, Moderna)
- Viral vector vaccines (Johnson & Johnson, AstraZeneca)
- Protein subunit vaccines (Novavax)

**Effectiveness**
Vaccines significantly reduce the risk of severe illness, hospitalization, and death from COVID-19. While breakthrough infections can occur, vaccinated individuals generally experience milder symptoms.

**Who Should Get Vaccinated**
COVID-19 vaccination is recommended for everyone 6 months and older, with rare exceptions. Consult your healthcare provider if you have specific concerns.

**Common Side Effects**
Side effects like arm soreness, fatigue, headache, and fever are normal and indicate your immune system is responding. They typically resolve within 1-3 days.

**Boosters**
Additional doses may be recommended based on your age, health status, and the time since your last vaccination. Check with your healthcare provider for current recommendations.

**Special Populations**
Pregnant women, immunocompromised individuals, and older adults may have specific recommendations. Healthcare providers can offer personalized guidance.`,
    readTime: "6 min read",
    imageKeyword: "vaccine"
  }
];

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      return new Promise<Article[]>((resolve) => {
        setTimeout(() => resolve(MOCK_ARTICLES), 200);
      });
    },
  });
}
