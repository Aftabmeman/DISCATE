import { redirect } from 'next/navigation';

export default function DeprecatedLayout() {
  redirect('/dashboard');
}
