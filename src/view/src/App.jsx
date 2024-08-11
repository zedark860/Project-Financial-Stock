import React, { useState } from 'react';
import Navbar from './components/navbar/Navbar';
import FinancialTableMov_Mensal from './components/table/FinancialTableMov_Mensal';
import FinancialTableMov_Total from './components/table/FinancialTableMov_Total';

function App() {
  const [isTotalView, setIsTotalView] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');

  const toggleView = () => {
    setIsTotalView(prevState => !prevState);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleFilter = (filter) => {
    setFilter(filter);
  };

  return (
    <>
      <Navbar 
        toggleView={toggleView} 
        isTotalView={isTotalView}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        onFilter={handleFilter}
      />
      {isTotalView 
        ? <FinancialTableMov_Mensal searchTerm={searchTerm} filter={filter} /> 
        : <FinancialTableMov_Total searchTerm={searchTerm} filter={filter} />}
    </>
  );
}

export default App;
