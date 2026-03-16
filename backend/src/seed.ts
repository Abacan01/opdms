import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

const DOCTORS = [
  {
    name: "Dr. John Doe De Castro",
    specialization: "Cardiologist",
    clinicSchedule: "M, T, W, TH, Sat 9:00am-3:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=11",
    services: ["ECG", "General Consultation", "Heart Check", "Blood Test"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0962-987-1010",
    email: "johndoe.castro@djmc.com",
    specializationDesc: "A cardiologist is a physician specializing in the diagnosis, treatment, and prevention of diseases and conditions related to the heart and blood vessels. They are experts in the cardiovascular system, including the heart muscle itself and the arteries and veins that carry blood. Cardiologists can perform procedures, prescribe medications, and provide long-term management for various heart conditions.",
    whyMe: "Dr. John Doe De Castro is a highly skilled cardiologist who graduated from the University of Santo Tomas College of Medicine. With over 10 years of experience in diagnosing and treating complex heart conditions, he has developed a strong reputation for his work in preventive cardiology and advanced heart failure management. Dedicated to both patient care and research, he continues to advocate for heart health awareness across the country.",
  },
  {
    name: "Dra. Jasper Jean Mariano",
    specialization: "Cardiologist",
    clinicSchedule: "M, T, W, TH, Sat 8:00am-3:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=5",
    services: ["ECG", "General Consultation", "X-Ray", "Cardiac Stress Test"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0962-987-1010",
    email: "marianojasperjean@gmail.com",
    specializationDesc: "A cardiologist is a physician specializing in the diagnosis, treatment, and prevention of diseases and conditions related to the heart and blood vessels. They are experts in the cardiovascular system, including the heart muscle itself and the arteries and veins that carry blood. Cardiologists can perform procedures, prescribe medications, and provide long-term management for various heart conditions.",
    whyMe: "Dra. Jasper Jean Mariano is a highly skilled cardiologist who graduated with honors from the Philippines College of Medicine. Known for her compassionate care and sharp clinical expertise, she specializes in diagnosing and treating complex heart conditions. Dra. Mariano completed her residency and fellowship at the Philippine Heart Center, where she developed a strong reputation for her work in preventive cardiology and advanced heart failure management.",
  },
  {
    name: "Dra. D.Hessa Ackerman",
    specialization: "Physical Therapist",
    clinicSchedule: "M, W, F 9:00am-5:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=9",
    services: ["Physical Therapy Session", "Rehabilitation", "Mobility Assessment", "Post-Surgery Rehab"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0917-555-0234",
    email: "hessa.ackerman@djmc.com",
    specializationDesc: "Physical therapists help patients improve movement and manage pain. They work with people of all ages who have medical problems, illnesses, or injuries that limit their regular ability to move and function. Physical therapists examine patients and develop plans using treatment techniques to promote the ability to move, reduce pain, restore function, and prevent disability.",
    whyMe: "Dra. D.Hessa Ackerman is a licensed physical therapist with extensive experience in musculoskeletal rehabilitation. She has helped hundreds of patients recover from injuries, surgeries, and chronic pain conditions. Her patient-centered approach and evidence-based treatment protocols ensure the best possible outcomes for every patient she treats.",
  },
  {
    name: "Dr. Maria Santos",
    specialization: "General Practitioner",
    clinicSchedule: "M-F 8:00am-5:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=10",
    services: ["General Consultation", "Vaccination", "Medical Care", "Urinalysis", "Blood Test"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0998-765-4321",
    email: "maria.santos@djmc.com",
    specializationDesc: "A general practitioner (GP) is a medical doctor who provides primary care services, treating a wide range of health conditions. They are often the first point of contact for patients and play a crucial role in managing overall health, preventive care, and coordinating specialist referrals when needed.",
    whyMe: "Dr. Maria Santos brings over 15 years of experience in primary care medicine. She is passionate about preventive health and patient education, believing that informed patients make better health decisions. Her warm and approachable manner puts patients at ease, while her thorough clinical assessments ensure comprehensive care.",
  },
  {
    name: "Dr. James Lee",
    specialization: "Dermatologist",
    clinicSchedule: "T, TH 10:00am-4:00pm",
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    services: ["Skin Consultation", "Acne Treatment", "Skin Biopsy", "Cosmetic Consultation"],
    officeAddress: "Don Juan Medical Center, Hilltop Batangas City",
    phone: "0912-345-6789",
    email: "james.lee@djmc.com",
    specializationDesc: "Dermatologists specialize in conditions of the skin, hair, and nails. They diagnose and treat more than 3,000 different diseases, from common conditions like acne and eczema to complex issues like skin cancer. Dermatologists also perform cosmetic procedures to improve the appearance of the skin.",
    whyMe: "Dr. James Lee is a board-certified dermatologist with a special interest in medical and cosmetic dermatology. He graduated from the University of the Philippines College of Medicine and completed his dermatology residency at the Philippine Dermatological Society. His expertise encompasses both medical skin conditions and aesthetic treatments.",
  },
];

const ARTICLES = [
  {
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
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
  },
  {
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
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  },
  {
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
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  },
  {
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
    imageUrl: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&q=80",
  },
  {
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
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
  },
  {
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
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  },
];

const HEALTH_SERVICES = [
  {
    name: "Laboratory Test",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
    description: "Laboratory tests involve analyzing samples such as blood, urine, or tissue to detect and measure substances in the body.",
    fullDescription: "Laboratory Test involves analyzing samples such as blood, urine, or tissue to detect and measure substances in the body. These tests help doctors diagnose illnesses, monitor the effectiveness of treatments, screen for health risks, and guide medical decisions. Common types include blood tests, urinalysis, and microbiology cultures. Laboratory tests are essential tools for early detection of diseases and maintaining overall health.",
    sections: [
      { title: "Types of Laboratory Tests", content: "" },
      { title: "Blood Tests", content: "Tests performed on a blood sample to assess overall health, diagnose conditions, or monitor treatments.\n\nServices Offered:\n\u2022 Complete Blood Count (CBC): Checks for infections, anemia, and blood disorders.\n\u2022 Blood Chemistry Panel (Blood Chem): Evaluates organ function by measuring substances like glucose and electrolytes.\n\u2022 Lipid Profile: Measures cholesterol and triglyceride levels to assess heart disease risk.\n\u2022 Thyroid Function Tests: Measures hormones to check thyroid health.\n\u2022 HbA1c Test: Monitors long-term blood sugar levels for diabetes management." },
      { title: "Urine Tests", content: "Tests performed on a urine sample to evaluate kidney function, detect infections, or screen for metabolic disorders.\n\nServices Offered:\n\u2022 Urinalysis (UA): Checks urine color, clarity, and composition to detect kidney issues or infections.\n\u2022 Urine Culture and Sensitivity: Identifies bacteria causing urinary tract infections.\n\u2022 24-Hour Urine Collection: Measures substances excreted over a full day for kidney disease assessment." },
    ],
  },
  {
    name: "Lab Imaging Test",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    description: "Lab imaging tests use technology to create pictures of the inside of the body to help diagnose conditions.",
    fullDescription: "Lab Imaging Tests use advanced technology to create visual representations of internal body structures. These non-invasive or minimally invasive procedures allow doctors to detect abnormalities, assess the extent of disease, and guide treatment planning. From simple X-rays to sophisticated MRI scans, imaging tests are fundamental diagnostic tools in modern medicine.",
    sections: [
      { title: "Types of Imaging Tests", content: "\u2022 X-Ray: Uses radiation to create images of bones and some soft tissues.\n\u2022 Ultrasound: Uses sound waves to produce images of organs and structures.\n\u2022 CT Scan: Provides detailed cross-sectional images using X-rays.\n\u2022 MRI: Uses magnetic fields to create detailed images of soft tissue.\n\u2022 ECG/EKG: Records electrical activity of the heart." },
      { title: "When Are Imaging Tests Used?", content: "Imaging tests are ordered when doctors need to see inside the body to diagnose or monitor conditions such as fractures, tumors, heart disease, or internal bleeding." },
    ],
  },
  {
    name: "Rehabilitation",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    description: "Rehabilitation services help patients recover from injuries, surgeries, or chronic conditions through targeted therapy.",
    fullDescription: "Rehabilitation services at Don Juan Medical Center are designed to restore function, improve mobility, and enhance quality of life for patients recovering from injury, surgery, or managing chronic conditions. Our multidisciplinary team uses evidence-based approaches to create personalized treatment plans.",
    sections: [
      { title: "Physical Therapy", content: "Restores movement and function through exercises, manual therapy, and other techniques. Treats conditions like back pain, sports injuries, and post-surgical recovery." },
      { title: "Occupational Therapy", content: "Helps patients regain skills for daily living and work. Focuses on fine motor skills, cognitive rehabilitation, and adaptive equipment training." },
      { title: "Speech Therapy", content: "Addresses communication disorders and swallowing difficulties. Beneficial after stroke, traumatic brain injury, or for developmental speech delays." },
    ],
  },
  {
    name: "Psychological Counseling",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    description: "Professional mental health support to help patients manage stress, anxiety, depression, and other psychological concerns.",
    fullDescription: "Psychological Counseling provides compassionate, professional support for individuals dealing with mental health challenges. Our licensed psychologists and counselors offer evidence-based therapies to help patients overcome obstacles, develop coping strategies, and improve overall mental wellness.",
    sections: [
      { title: "Services Offered", content: "\u2022 Individual Therapy: One-on-one sessions tailored to personal needs.\n\u2022 Cognitive Behavioral Therapy (CBT): Addresses negative thought patterns.\n\u2022 Family Counseling: Improves communication and resolves family conflicts.\n\u2022 Grief Counseling: Supports individuals through loss.\n\u2022 Stress Management: Techniques for managing work and life stressors." },
      { title: "Who Can Benefit?", content: "Anyone experiencing anxiety, depression, trauma, relationship issues, grief, work-related stress, or simply seeking personal growth can benefit from psychological counseling." },
    ],
  },
  {
    name: "Minor Surgery",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
    description: "Minor surgical procedures performed on an outpatient basis under local anesthesia for various medical conditions.",
    fullDescription: "Minor Surgery at Don Juan Medical Center covers a range of outpatient procedures performed under local anesthesia. These procedures are typically brief, carry low risk, and allow patients to return home the same day. Our experienced surgical team ensures patient comfort and safety throughout.",
    sections: [
      { title: "Common Minor Surgical Procedures", content: "\u2022 Wound Closure: Suturing of lacerations and cuts.\n\u2022 Cyst Removal: Excision of sebaceous or epidermal cysts.\n\u2022 Incision and Drainage: Treatment of abscesses.\n\u2022 Biopsy: Tissue sampling for diagnostic purposes.\n\u2022 Ingrown Toenail Removal: Surgical correction of painful ingrown nails.\n\u2022 Skin Tag and Wart Removal: Cosmetic and medical removal of skin growths." },
      { title: "What to Expect", content: "Minor surgical procedures are performed in our clean, well-equipped outpatient clinic. You will receive local anesthesia to minimize discomfort. Most procedures take 15\u201360 minutes. You may return home shortly after. Detailed post-operative care instructions will be provided." },
    ],
  },
  {
    name: "Treatments",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    description: "Comprehensive treatment services for acute and chronic conditions, managed by experienced medical professionals.",
    fullDescription: "Our Treatment services encompass a wide range of medical interventions for both acute and chronic health conditions. Using the latest evidence-based practices, our doctors provide personalized treatment plans to help patients achieve and maintain optimal health.",
    sections: [
      { title: "General Medicine", content: "Diagnosis and management of common illnesses including infections, hypertension, diabetes, asthma, and more. Our physicians provide comprehensive health assessments and ongoing care." },
      { title: "Infusion Therapy", content: "Intravenous (IV) treatments for conditions requiring hydration, antibiotic administration, or specialized medications under medical supervision." },
      { title: "Chronic Disease Management", content: "Long-term management of conditions such as diabetes, hypertension, heart disease, and autoimmune disorders through regular monitoring, lifestyle counseling, and medication management." },
    ],
  },
  {
    name: "Dental Services",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
    description: "Complete dental care services from routine check-ups and cleanings to restorative and cosmetic procedures.",
    fullDescription: "Don Juan Medical Center Dental Services provide comprehensive oral healthcare for patients of all ages. From preventive care to complex restorative procedures, our dental team is committed to maintaining your oral health and giving you a confident smile.",
    sections: [
      { title: "Preventive Care", content: "\u2022 Dental Check-up and Cleaning (Prophylaxis)\n\u2022 Oral Cancer Screening\n\u2022 Dental X-Rays\n\u2022 Fluoride Treatment\n\u2022 Sealants for Cavity Prevention" },
      { title: "Restorative Services", content: "\u2022 Tooth-colored Composite Fillings\n\u2022 Dental Crowns and Bridges\n\u2022 Dentures (Full and Partial)\n\u2022 Root Canal Treatment\n\u2022 Tooth Extraction" },
    ],
  },
  {
    name: "Vaccination Services",
    image: "https://images.unsplash.com/photo-1618961734760-466979ce35b0?w=800&q=80",
    description: "Immunization services for children and adults to prevent infectious diseases and maintain community health.",
    fullDescription: "Our Vaccination Services provide immunization against a wide range of preventable diseases for patients of all ages. Following the national immunization schedule and international travel vaccination guidelines, our medical staff ensures safe and effective vaccine administration.",
    sections: [
      { title: "Available Vaccines", content: "\u2022 Influenza (Flu) Vaccine \u2013 Annual\n\u2022 Hepatitis A and B\n\u2022 Pneumococcal Vaccine\n\u2022 Tetanus, Diphtheria, Pertussis (Tdap)\n\u2022 HPV Vaccine\n\u2022 COVID-19 Vaccines and Boosters\n\u2022 Typhoid Vaccine\n\u2022 Varicella (Chickenpox)\n\u2022 Measles, Mumps, Rubella (MMR)" },
      { title: "Travel Vaccination", content: "We provide pre-travel consultation and vaccination packages for individuals planning international travel to high-risk regions." },
    ],
  },
  {
    name: "Eye Care",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
    description: "Comprehensive eye examinations and treatment for vision problems and ocular conditions by qualified ophthalmologists.",
    fullDescription: "Eye Care services at Don Juan Medical Center provide thorough diagnosis and treatment for a wide range of eye conditions. Our ophthalmologists use state-of-the-art equipment to deliver accurate diagnoses and effective treatments, protecting your vision for years to come.",
    sections: [
      { title: "Services Offered", content: "\u2022 Comprehensive Eye Examination\n\u2022 Visual Acuity Testing\n\u2022 Refraction and Prescription of Eyeglasses/Contact Lenses\n\u2022 Glaucoma Screening\n\u2022 Cataract Assessment\n\u2022 Diabetic Retinopathy Screening\n\u2022 Dry Eye Treatment" },
    ],
  },
];

const SPECIALIZATIONS = [
  {
    name: "Hospital Medicine",
    description: "Comprehensive care for hospitalized patients",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&q=80",
    link: "/doctors",
  },
  {
    name: "Neurology",
    description: "Disorders of the nervous system",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80",
    link: "/doctors",
  },
  {
    name: "Obstetrics and Gynecology",
    description: "Care of women during pregnancy",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80",
    link: "/doctors",
  },
];

const NEWS = [
  {
    title: "DOH improves healthcare, brings services closer to people",
    source: "Updates from the Department of Health",
    excerpt: "On March 24, the Catheterization Laboratory (CathLab) at the Jose B. Lingad Memorial General Hospital in San Fernando City, Pampanga province opened to Central Luzon residents who need interventional cardiac and non-cardiac procedures under interventional radiology. It was completed in 130 days through funding from the Health Facilities Enhancement Program and in coordination with provincial and local government units. Its funding was taken out of the PHP 1 billion budget given to the hospital in 2013 for the provision of equipment and buildings.",
    image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=400&q=80",
    publishedAt: new Date(),
  },
];

async function seed() {
  console.log("Seeding Firestore...\n");

  // Doctors
  console.log("Seeding doctors...");
  for (const doctor of DOCTORS) {
    await db.collection("doctors").add(doctor);
  }
  console.log(`  Added ${DOCTORS.length} doctors`);

  // Articles
  console.log("Seeding articles...");
  for (const article of ARTICLES) {
    await db.collection("articles").add({
      ...article,
      publishedAt: new Date(),
    });
  }
  console.log(`  Added ${ARTICLES.length} articles`);

  // Health Services
  console.log("Seeding health_services...");
  for (const service of HEALTH_SERVICES) {
    await db.collection("health_services").add(service);
  }
  console.log(`  Added ${HEALTH_SERVICES.length} health services`);

  // Specializations
  console.log("Seeding specializations...");
  for (const spec of SPECIALIZATIONS) {
    await db.collection("specializations").add(spec);
  }
  console.log(`  Added ${SPECIALIZATIONS.length} specializations`);

  // News
  console.log("Seeding news...");
  for (const item of NEWS) {
    await db.collection("news").add(item);
  }
  console.log(`  Added ${NEWS.length} news items`);

  console.log("\nSeeding complete!");
}

seed().catch(console.error);
