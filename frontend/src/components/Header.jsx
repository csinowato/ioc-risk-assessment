import React from 'react';
import { Shield } from 'lucide-react';

const Header = () => {
  return (
    <div className="flex items-center gap-3 mb-8">
      <Shield className="h-8 w-8 text-slate-400" />
      <h1 className="text-3xl font-bold text-gray-900">
        IOC Risk Assessment Tool
      </h1>
    </div>
  );
};

export default Header;