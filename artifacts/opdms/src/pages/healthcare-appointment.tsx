import { useState } from "react";
import { Layout } from "@/components/layout";
import { Search, X, ChevronLeft, ChevronRight, CalendarPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { useLocation } from "wouter";

export interface HealthService {
  id: number;
  name: string;
  description: string;
  image: string;
  fullDescription: string;
  sections: { title: string; content: string }[];
}

export const HEALTH_SERVICES: HealthService[] = [
  {
    id: 1,
    name: "Laboratory Test",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
    description:
      "Laboratory tests involve analyzing samples such as blood, urine, or tissue to detect and measure substances in the body.",
    fullDescription:
      "Laboratory Test involves analyzing samples such as blood, urine, or tissue to detect and measure substances in the body. These tests help doctors diagnose illnesses, monitor the effectiveness of treatments, screen for health risks, and guide medical decisions. Common types include blood tests, urinalysis, and microbiology cultures. Laboratory tests are essential tools for early detection of diseases and maintaining overall health.",
    sections: [
      {
        title: "Types of Laboratory Tests",
        content: "",
      },
      {
        title: "Blood Tests",
        content:
          "Tests performed on a blood sample to assess overall health, diagnose conditions, or monitor treatments.\n\nServices Offered:\n• Complete Blood Count (CBC): Checks for infections, anemia, and blood disorders.\n• Blood Chemistry Panel (Blood Chem): Evaluates organ function by measuring substances like glucose and electrolytes.\n• Lipid Profile: Measures cholesterol and triglyceride levels to assess heart disease risk.\n• Thyroid Function Tests: Measures hormones to check thyroid health.\n• HbA1c Test: Monitors long-term blood sugar levels for diabetes management.",
      },
      {
        title: "Urine Tests",
        content:
          "Tests performed on a urine sample to evaluate kidney function, detect infections, or screen for metabolic disorders.\n\nServices Offered:\n• Urinalysis (UA): Checks urine color, clarity, and composition to detect kidney issues or infections.\n• Urine Culture and Sensitivity: Identifies bacteria causing urinary tract infections.\n• 24-Hour Urine Collection: Measures substances excreted over a full day for kidney disease assessment.",
      },
    ],
  },
  {
    id: 2,
    name: "Lab Imaging Test",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    description:
      "Lab imaging tests use technology to create pictures of the inside of the body to help diagnose conditions.",
    fullDescription:
      "Lab Imaging Tests use advanced technology to create visual representations of internal body structures. These non-invasive or minimally invasive procedures allow doctors to detect abnormalities, assess the extent of disease, and guide treatment planning. From simple X-rays to sophisticated MRI scans, imaging tests are fundamental diagnostic tools in modern medicine.",
    sections: [
      {
        title: "Types of Imaging Tests",
        content:
          "• X-Ray: Uses radiation to create images of bones and some soft tissues.\n• Ultrasound: Uses sound waves to produce images of organs and structures.\n• CT Scan: Provides detailed cross-sectional images using X-rays.\n• MRI: Uses magnetic fields to create detailed images of soft tissue.\n• ECG/EKG: Records electrical activity of the heart.",
      },
      {
        title: "When Are Imaging Tests Used?",
        content:
          "Imaging tests are ordered when doctors need to see inside the body to diagnose or monitor conditions such as fractures, tumors, heart disease, or internal bleeding.",
      },
    ],
  },
  {
    id: 3,
    name: "Rehabilitation",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    description:
      "Rehabilitation services help patients recover from injuries, surgeries, or chronic conditions through targeted therapy.",
    fullDescription:
      "Rehabilitation services at Don Juan Medical Center are designed to restore function, improve mobility, and enhance quality of life for patients recovering from injury, surgery, or managing chronic conditions. Our multidisciplinary team uses evidence-based approaches to create personalized treatment plans.",
    sections: [
      {
        title: "Physical Therapy",
        content:
          "Restores movement and function through exercises, manual therapy, and other techniques. Treats conditions like back pain, sports injuries, and post-surgical recovery.",
      },
      {
        title: "Occupational Therapy",
        content:
          "Helps patients regain skills for daily living and work. Focuses on fine motor skills, cognitive rehabilitation, and adaptive equipment training.",
      },
      {
        title: "Speech Therapy",
        content:
          "Addresses communication disorders and swallowing difficulties. Beneficial after stroke, traumatic brain injury, or for developmental speech delays.",
      },
    ],
  },
  {
    id: 4,
    name: "Psychological Counseling",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    description:
      "Professional mental health support to help patients manage stress, anxiety, depression, and other psychological concerns.",
    fullDescription:
      "Psychological Counseling provides compassionate, professional support for individuals dealing with mental health challenges. Our licensed psychologists and counselors offer evidence-based therapies to help patients overcome obstacles, develop coping strategies, and improve overall mental wellness.",
    sections: [
      {
        title: "Services Offered",
        content:
          "• Individual Therapy: One-on-one sessions tailored to personal needs.\n• Cognitive Behavioral Therapy (CBT): Addresses negative thought patterns.\n• Family Counseling: Improves communication and resolves family conflicts.\n• Grief Counseling: Supports individuals through loss.\n• Stress Management: Techniques for managing work and life stressors.",
      },
      {
        title: "Who Can Benefit?",
        content:
          "Anyone experiencing anxiety, depression, trauma, relationship issues, grief, work-related stress, or simply seeking personal growth can benefit from psychological counseling.",
      },
    ],
  },
  {
    id: 5,
    name: "Minor Surgery",
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
    description:
      "Minor surgical procedures performed on an outpatient basis under local anesthesia for various medical conditions.",
    fullDescription:
      "Minor Surgery at Don Juan Medical Center covers a range of outpatient procedures performed under local anesthesia. These procedures are typically brief, carry low risk, and allow patients to return home the same day. Our experienced surgical team ensures patient comfort and safety throughout.",
    sections: [
      {
        title: "Common Minor Surgical Procedures",
        content:
          "• Wound Closure: Suturing of lacerations and cuts.\n• Cyst Removal: Excision of sebaceous or epidermal cysts.\n• Incision and Drainage: Treatment of abscesses.\n• Biopsy: Tissue sampling for diagnostic purposes.\n• Ingrown Toenail Removal: Surgical correction of painful ingrown nails.\n• Skin Tag and Wart Removal: Cosmetic and medical removal of skin growths.",
      },
      {
        title: "What to Expect",
        content:
          "Minor surgical procedures are performed in our clean, well-equipped outpatient clinic. You will receive local anesthesia to minimize discomfort. Most procedures take 15–60 minutes. You may return home shortly after. Detailed post-operative care instructions will be provided.",
      },
    ],
  },
  {
    id: 6,
    name: "Treatments",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80",
    description:
      "Comprehensive treatment services for acute and chronic conditions, managed by experienced medical professionals.",
    fullDescription:
      "Our Treatment services encompass a wide range of medical interventions for both acute and chronic health conditions. Using the latest evidence-based practices, our doctors provide personalized treatment plans to help patients achieve and maintain optimal health.",
    sections: [
      {
        title: "General Medicine",
        content:
          "Diagnosis and management of common illnesses including infections, hypertension, diabetes, asthma, and more. Our physicians provide comprehensive health assessments and ongoing care.",
      },
      {
        title: "Infusion Therapy",
        content:
          "Intravenous (IV) treatments for conditions requiring hydration, antibiotic administration, or specialized medications under medical supervision.",
      },
      {
        title: "Chronic Disease Management",
        content:
          "Long-term management of conditions such as diabetes, hypertension, heart disease, and autoimmune disorders through regular monitoring, lifestyle counseling, and medication management.",
      },
    ],
  },
  {
    id: 7,
    name: "Dental Services",
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
    description:
      "Complete dental care services from routine check-ups and cleanings to restorative and cosmetic procedures.",
    fullDescription:
      "Don Juan Medical Center Dental Services provide comprehensive oral healthcare for patients of all ages. From preventive care to complex restorative procedures, our dental team is committed to maintaining your oral health and giving you a confident smile.",
    sections: [
      {
        title: "Preventive Care",
        content:
          "• Dental Check-up and Cleaning (Prophylaxis)\n• Oral Cancer Screening\n• Dental X-Rays\n• Fluoride Treatment\n• Sealants for Cavity Prevention",
      },
      {
        title: "Restorative Services",
        content:
          "• Tooth-colored Composite Fillings\n• Dental Crowns and Bridges\n• Dentures (Full and Partial)\n• Root Canal Treatment\n• Tooth Extraction",
      },
    ],
  },
  {
    id: 8,
    name: "Vaccination Services",
    image: "https://images.unsplash.com/photo-1618961734760-466979ce35b0?w=800&q=80",
    description:
      "Immunization services for children and adults to prevent infectious diseases and maintain community health.",
    fullDescription:
      "Our Vaccination Services provide immunization against a wide range of preventable diseases for patients of all ages. Following the national immunization schedule and international travel vaccination guidelines, our medical staff ensures safe and effective vaccine administration.",
    sections: [
      {
        title: "Available Vaccines",
        content:
          "• Influenza (Flu) Vaccine – Annual\n• Hepatitis A and B\n• Pneumococcal Vaccine\n• Tetanus, Diphtheria, Pertussis (Tdap)\n• HPV Vaccine\n• COVID-19 Vaccines and Boosters\n• Typhoid Vaccine\n• Varicella (Chickenpox)\n• Measles, Mumps, Rubella (MMR)",
      },
      {
        title: "Travel Vaccination",
        content:
          "We provide pre-travel consultation and vaccination packages for individuals planning international travel to high-risk regions.",
      },
    ],
  },
  {
    id: 9,
    name: "Eye Care",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
    description:
      "Comprehensive eye examinations and treatment for vision problems and ocular conditions by qualified ophthalmologists.",
    fullDescription:
      "Eye Care services at Don Juan Medical Center provide thorough diagnosis and treatment for a wide range of eye conditions. Our ophthalmologists use state-of-the-art equipment to deliver accurate diagnoses and effective treatments, protecting your vision for years to come.",
    sections: [
      {
        title: "Services Offered",
        content:
          "• Comprehensive Eye Examination\n• Visual Acuity Testing\n• Refraction and Prescription of Eyeglasses/Contact Lenses\n• Glaucoma Screening\n• Cataract Assessment\n• Diabetic Retinopathy Screening\n• Dry Eye Treatment",
      },
    ],
  },
];

const ITEMS_PER_PAGE = 6;

export default function HealthcareAppointment() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<HealthService | null>(null);
  const [, navigate] = useLocation();

  const filtered = HEALTH_SERVICES.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Healthcare Appointment</h1>
          <p className="text-muted-foreground mt-1">Browse one of our hospital Services and book an appointment</p>
        </div>
        <button
          onClick={() => navigate("/schedule")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-foreground text-background shadow hover:bg-foreground/90 transition-all"
        >
          <CalendarPlus className="w-4 h-4" />
          Schedule Appointment
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80 mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search for a health service..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
        />
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginated.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card border rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-44 overflow-hidden">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-white font-display font-bold text-lg drop-shadow">
                {service.name}
              </h3>
            </div>
            <div className="p-4">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{service.description}</p>
              <button
                onClick={() => setSelected(service)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-sm disabled:opacity-40 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border font-medium text-sm disabled:opacity-40 hover:bg-muted transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Service Detail Modal */}
      <Dialog.Root open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <AnimatePresence>
          {selected && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <Dialog.Content
                asChild
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                  {/* Image Banner */}
                  <div className="relative h-52 shrink-0">
                    <img
                      src={selected.image}
                      alt={selected.name}
                      className="w-full h-full object-cover"
                    />
                    <Dialog.Close className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors">
                      <X className="w-4 h-4" />
                    </Dialog.Close>
                  </div>

                  {/* Content */}
                  <div className="overflow-y-auto flex-1 p-6">
                    <Dialog.Title className="text-2xl font-display font-bold flex items-center gap-2 mb-4">
                      🧪 {selected.name}
                    </Dialog.Title>

                    <button
                      onClick={() => { setSelected(null); navigate("/schedule"); }}
                      className="w-full mb-6 py-3 rounded-xl font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
                    >
                      Schedule a Service
                    </button>

                    <p className="text-sm text-foreground/80 leading-relaxed mb-5">
                      {selected.fullDescription}
                    </p>

                    {selected.sections.map((section, i) => (
                      <div key={i} className="mb-4">
                        <h4 className="font-bold text-foreground text-sm mb-2">{section.title}</h4>
                        {section.content && (
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {section.content}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Layout>
  );
}
