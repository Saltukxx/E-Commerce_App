import { redirect } from 'next/navigation';

export default function AdminStripeRedirectPage() {
  redirect('/admin/stores');
}
