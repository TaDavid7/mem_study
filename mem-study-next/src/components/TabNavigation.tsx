'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { id: 'home', label: 'Home', href: '/home' },
  { id: 'quiz', label: 'Quiz', href: '/quiz' },
  { id: 'review', label: 'Review', href: '/review' },
];

export default function TabNavigation() {
  const pathname = usePathname();

  return (
    <ul role="tablist" className="flex space-x-2 border-b border-gray-300 p-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <li key={tab.id}>
            <Link
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={`inline-block p-4 text-gray-400 bg-gray-100 rounded-md bg-transparent hover:bg-gray-200 ${
                isActive
                  ? 'border-b border-indigo-500 rounded-none text-indigo-500'
                  : ''
              }`}
            >
              {tab.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
