import { 
  ShoppingBag, 
  Store, 
  UtensilsCrossed, 
  Heart, 
  GraduationCap, 
  Building2, 
  Truck, 
  Factory, 
  Briefcase,
  Users,
  Calendar,
  Package,
  DollarSign,
  FileText,
  BarChart3,
  Shield,
  UserCheck,
  Clock,
  TrendingUp,
  Receipt,
  CreditCard,
  BookOpen,
  Calculator,
  PieChart,
  FileSpreadsheet,
  Banknote,
  Coins,
  ChevronRight
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface SolutionType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  features: Feature[];
  benefits: string[];
  idealFor: string[];
  color: string;
  bgGradient: string;
}

export const solutionTypes: SolutionType[] = [
  {
    id: 'retail',
    title: 'Retail & E-commerce',
    description: 'Complete retail management from inventory to customer experience',
    icon: ShoppingBag,
    route: '/solutions/retail',
    color: 'purple',
    bgGradient: 'from-purple-50 to-pink-50',
    features: [
      {
        icon: Package,
        title: 'Inventory Management',
        description: 'Real-time stock tracking across locations'
      },
      {
        icon: BarChart3,
        title: 'Sales Analytics',
        description: 'Comprehensive sales insights and forecasting'
      },
      {
        icon: Users,
        title: 'Customer Management',
        description: 'CRM with loyalty programs and engagement'
      },
      {
        icon: CreditCard,
        title: 'Payment Processing',
        description: 'Integrated POS and payment solutions'
      }
    ],
    benefits: [
      'Increase sales by 30% with data-driven insights',
      'Reduce stockouts by 50% with AI predictions',
      'Improve customer retention by 40%',
      'Automate 80% of routine tasks'
    ],
    idealFor: [
      'Retail stores',
      'E-commerce businesses',
      'Multi-location retailers',
      'Fashion boutiques'
    ]
  },
  {
    id: 'restaurant',
    title: 'Restaurant & Hospitality',
    description: 'End-to-end restaurant operations and guest experience management',
    icon: UtensilsCrossed,
    route: '/solutions/restaurant',
    color: 'orange',
    bgGradient: 'from-orange-50 to-red-50',
    features: [
      {
        icon: Receipt,
        title: 'Order Management',
        description: 'Seamless order processing and kitchen display'
      },
      {
        icon: Calendar,
        title: 'Table Reservations',
        description: 'Smart booking and table management'
      },
      {
        icon: Package,
        title: 'Inventory Control',
        description: 'Recipe costing and stock management'
      },
      {
        icon: Users,
        title: 'Staff Scheduling',
        description: 'Automated scheduling and labor optimization'
      }
    ],
    benefits: [
      'Reduce food waste by 35%',
      'Increase table turnover by 25%',
      'Improve order accuracy to 99.5%',
      'Cut labor costs by 20%'
    ],
    idealFor: [
      'Restaurants',
      'Cafes & coffee shops',
      'Food trucks',
      'Hotel restaurants'
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Clinics',
    description: 'Patient-centric healthcare management and clinical operations',
    icon: Heart,
    route: '/solutions/healthcare',
    color: 'blue',
    bgGradient: 'from-blue-50 to-cyan-50',
    features: [
      {
        icon: UserCheck,
        title: 'Patient Management',
        description: 'Complete patient records and history'
      },
      {
        icon: Calendar,
        title: 'Appointment Scheduling',
        description: 'Smart scheduling with reminders'
      },
      {
        icon: FileText,
        title: 'Electronic Health Records',
        description: 'Secure, compliant health records'
      },
      {
        icon: DollarSign,
        title: 'Billing & Insurance',
        description: 'Automated billing and claims processing'
      }
    ],
    benefits: [
      'Reduce no-shows by 40%',
      'Improve patient satisfaction by 45%',
      'Accelerate billing cycles by 60%',
      'Ensure 100% HIPAA compliance'
    ],
    idealFor: [
      'Medical clinics',
      'Dental practices',
      'Therapy centers',
      'Specialty clinics'
    ]
  },
  {
    id: 'education',
    title: 'Education & Training',
    description: 'Comprehensive education management for schools and training centers',
    icon: GraduationCap,
    route: '/solutions/education',
    color: 'indigo',
    bgGradient: 'from-indigo-50 to-purple-50',
    features: [
      {
        icon: Users,
        title: 'Student Management',
        description: 'Complete student lifecycle tracking'
      },
      {
        icon: BookOpen,
        title: 'Course Management',
        description: 'Curriculum planning and scheduling'
      },
      {
        icon: Calculator,
        title: 'Grade Tracking',
        description: 'Automated grading and reporting'
      },
      {
        icon: Banknote,
        title: 'Fee Management',
        description: 'Tuition billing and payment tracking'
      }
    ],
    benefits: [
      'Improve student engagement by 50%',
      'Reduce administrative work by 70%',
      'Increase fee collection by 95%',
      'Enhance parent communication by 80%'
    ],
    idealFor: [
      'Private schools',
      'Training centers',
      'Tutoring businesses',
      'Language schools'
    ]
  },
  {
    id: 'realestate',
    title: 'Real Estate & Property',
    description: 'Property management and real estate operations platform',
    icon: Building2,
    route: '/solutions/realestate',
    color: 'green',
    bgGradient: 'from-green-50 to-emerald-50',
    features: [
      {
        icon: Building2,
        title: 'Property Management',
        description: 'Comprehensive property portfolio tracking'
      },
      {
        icon: Users,
        title: 'Tenant Management',
        description: 'Lease tracking and tenant communications'
      },
      {
        icon: Coins,
        title: 'Rent Collection',
        description: 'Automated rent and payment processing'
      },
      {
        icon: FileText,
        title: 'Document Management',
        description: 'Digital contracts and documentation'
      }
    ],
    benefits: [
      'Increase occupancy rates by 20%',
      'Reduce rent collection time by 75%',
      'Cut maintenance costs by 30%',
      'Improve tenant satisfaction by 40%'
    ],
    idealFor: [
      'Property managers',
      'Real estate agencies',
      'Rental businesses',
      'Commercial properties'
    ]
  },
  {
    id: 'logistics',
    title: 'Logistics & Transportation',
    description: 'Fleet management and logistics operations optimization',
    icon: Truck,
    route: '/solutions/logistics',
    color: 'yellow',
    bgGradient: 'from-yellow-50 to-amber-50',
    features: [
      {
        icon: Truck,
        title: 'Fleet Management',
        description: 'Vehicle tracking and maintenance'
      },
      {
        icon: Package,
        title: 'Shipment Tracking',
        description: 'Real-time delivery monitoring'
      },
      {
        icon: Users,
        title: 'Driver Management',
        description: 'Driver scheduling and performance'
      },
      {
        icon: TrendingUp,
        title: 'Route Optimization',
        description: 'AI-powered route planning'
      }
    ],
    benefits: [
      'Reduce fuel costs by 25%',
      'Improve delivery times by 30%',
      'Increase fleet utilization by 40%',
      'Cut operational costs by 35%'
    ],
    idealFor: [
      'Delivery companies',
      'Trucking businesses',
      'Courier services',
      'Distribution centers'
    ]
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing & Production',
    description: 'Production planning and manufacturing operations control',
    icon: Factory,
    route: '/solutions/manufacturing',
    color: 'gray',
    bgGradient: 'from-gray-50 to-slate-50',
    features: [
      {
        icon: Factory,
        title: 'Production Planning',
        description: 'Optimize production schedules'
      },
      {
        icon: Package,
        title: 'Inventory Control',
        description: 'Raw material and finished goods tracking'
      },
      {
        icon: Shield,
        title: 'Quality Control',
        description: 'Quality assurance and compliance'
      },
      {
        icon: BarChart3,
        title: 'Performance Analytics',
        description: 'Real-time production metrics'
      }
    ],
    benefits: [
      'Increase production efficiency by 35%',
      'Reduce material waste by 40%',
      'Improve quality scores by 25%',
      'Cut inventory costs by 30%'
    ],
    idealFor: [
      'Small manufacturers',
      'Job shops',
      'Assembly operations',
      'Custom fabricators'
    ]
  },
  {
    id: 'professional',
    title: 'Professional Services',
    description: 'Project management and professional service automation',
    icon: Briefcase,
    route: '/solutions/professional',
    color: 'teal',
    bgGradient: 'from-teal-50 to-cyan-50',
    features: [
      {
        icon: Clock,
        title: 'Time Tracking',
        description: 'Accurate time and billing tracking'
      },
      {
        icon: FileText,
        title: 'Project Management',
        description: 'Complete project lifecycle management'
      },
      {
        icon: DollarSign,
        title: 'Invoice Management',
        description: 'Automated invoicing and collections'
      },
      {
        icon: PieChart,
        title: 'Resource Planning',
        description: 'Team capacity and utilization'
      }
    ],
    benefits: [
      'Increase billable hours by 25%',
      'Improve project margins by 30%',
      'Reduce invoice time by 80%',
      'Enhance client satisfaction by 40%'
    ],
    idealFor: [
      'Consulting firms',
      'Law practices',
      'Accounting firms',
      'Marketing agencies'
    ]
  }
];

export const getSolutionById = (id: string): SolutionType | undefined => {
  return solutionTypes.find(solution => solution.id === id);
};

export const getSolutionByRoute = (route: string): SolutionType | undefined => {
  return solutionTypes.find(solution => solution.route === route);
};

export const getSolutionColor = (id: string): string => {
  const solution = getSolutionById(id);
  return solution?.color || 'blue';
};

export const getSolutionGradient = (id: string): string => {
  const solution = getSolutionById(id);
  return solution?.bgGradient || 'from-blue-50 to-indigo-50';
};