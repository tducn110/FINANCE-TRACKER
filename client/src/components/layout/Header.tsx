import { User } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Welcome back!</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700 pr-2">My Account</span>
        </div>
      </div>
    </header>
  );
}
