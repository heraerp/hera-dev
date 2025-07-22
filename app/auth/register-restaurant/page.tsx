import RestaurantRegistrationForm from '@/components/auth/RestaurantRegistrationForm';

export default function RegisterRestaurantPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <RestaurantRegistrationForm />
    </div>
  );
}