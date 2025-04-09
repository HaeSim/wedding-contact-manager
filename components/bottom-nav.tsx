'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Users, Filter, Settings } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className='fixed bottom-0 left-0 right-0 border-t bg-white'>
      <div className='mx-auto flex max-w-md justify-around'>
        <Link
          href='/'
          className={`flex flex-1 flex-col items-center justify-center py-3 ${
            pathname === '/' ? 'text-rose-500' : 'text-gray-500'
          }`}
        >
          <Home className='h-5 w-5' />
          <span className='mt-1 text-xs'>홈</span>
        </Link>
        <Link
          href='/review'
          className={`flex flex-1 flex-col items-center justify-center py-3 ${
            pathname.startsWith('/review') ? 'text-rose-500' : 'text-gray-500'
          }`}
        >
          <Users className='h-5 w-5' />
          <span className='mt-1 text-xs'>연락처</span>
        </Link>
        <Link
          href='/results'
          className={`flex flex-1 flex-col items-center justify-center py-3 ${
            pathname === '/results' ? 'text-rose-500' : 'text-gray-500'
          }`}
        >
          <Filter className='h-5 w-5' />
          <span className='mt-1 text-xs'>필터</span>
        </Link>
        <Link
          href='/options'
          className={`flex flex-1 flex-col items-center justify-center py-3 ${
            pathname === '/options' ? 'text-rose-500' : 'text-gray-500'
          }`}
        >
          <Settings className='h-5 w-5' />
          <span className='mt-1 text-xs'>설정</span>
        </Link>
      </div>
    </div>
  );
}
