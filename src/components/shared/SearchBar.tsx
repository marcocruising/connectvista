
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCRMStore } from '@/store/crmStore';

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useCRMStore();

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      <Input
        type="text"
        placeholder="Search contacts, companies, conversations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-crm-blue focus:border-transparent"
      />
    </div>
  );
};

export default SearchBar;
