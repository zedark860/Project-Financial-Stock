import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ toggleView, isTotalView, onSearch, onClearSearch, onFilter }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  const handleButtonClick = () => {
    toggleView();
  };

  const toggleFilters = () => {
    setShowFilters(prevState => !prevState);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onClearSearch();
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    onFilter(filter);
    setShowFilters(false);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="https://webcertificados.com.br/wp-content/uploads/2021/05/logo-site-1024x293.png" alt="Web Certificados" />
      </div>

      <div className="search-area">
        <input 
          type="text" 
          placeholder="Pesquisar" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button className="search-btn" onClick={handleSearch}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z"/>
          </svg>
        </button>

        <button className="btn limpar" onClick={handleClearSearch}>Limpar</button>
        <div className="filter-container">

          <button className="btn filtros" onClick={toggleFilters}>
            Filtros
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12">
              <path fill="currentColor" d="M7 10l5 5 5-5H7z"/>
            </svg>
          </button>

          {showFilters && (
            <div className="dropdown">
              <button 
                className={`dropdown-item ${selectedFilter === 'Entrada' ? 'active' : ''}`} 
                onClick={() => handleFilterSelect('Entrada')}
              >
                Entrada
              </button>

              <button 
                className={`dropdown-item ${selectedFilter === 'Saída' ? 'active' : ''}`} 
                onClick={() => handleFilterSelect('Saída')}
              >
                Saída
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="actions">
        <button className="mov-total" onClick={handleButtonClick}>
          {isTotalView ? 'MOV_TOTAL' : 'MOV_MENSAL'}
        </button>
        <button className="btn add-item">+ Add Item</button>
      </div>
      
    </nav>
  );
};

export default Navbar;