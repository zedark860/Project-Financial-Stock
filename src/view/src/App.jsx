import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar/Navbar';  // Importa o componente Navbar
import FinancialTableMov_Mensal from './components/table/FinancialTableMov_Mensal';  // Importa a tabela para visualização mensal
import FinancialTableMov_Total from './components/table/FinancialTableMov_Total';  // Importa a tabela para visualização total
import AddItemModal from './components/modalAddItem/AddItemModal';  // Importa o modal de adição de item

function App() {
  // Estado para alternar entre visualização total e mensal
  const [isTotalView, setIsTotalView] = useState(true);

  // Estado para armazenar o termo de busca
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para armazenar o filtro selecionado
  const [filter, setFilter] = useState('');

  // Estado para controlar a abertura/fechamento do modal de adição
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Estado para armazenar a lista de itens
  const [items, setItems] = useState({
    Total: [],
    Mensal: []
  });

  // Estado para indicar se um item foi salvo recentemente
  const [itemSaved, setItemSaved] = useState(null);

  useEffect(() => {
    // Restaurar o estado da visualização a partir do localStorage
    const savedView = localStorage.getItem('currentTableType');
    if (savedView) {
      setIsTotalView(savedView === 'Total');
      localStorage.removeItem('currentTableType'); // Limpar após restaurar
    }
  }, []);

  useEffect(() => {
    // Atualiza o estado da visualização no localStorage
    localStorage.setItem('currentTableType', isTotalView ? 'Total' : 'Mensal');
  }, [isTotalView]);

  // Função para alternar entre visualização total e mensal
  const toggleView = () => {
    setIsTotalView(prevState => !prevState);
  };

  // Função para atualizar o termo de busca
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Função para limpar o termo de busca
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Função para aplicar o filtro selecionado
  const handleFilter = (filter) => {
    setFilter(filter);
  };

  // Função para abrir o modal de adição de item
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Função para fechar o modal de adição de item
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Função para adicionar um novo item à lista
  const handleSaveItem = (newItem) => {
    setItems(prevItems => {
      const updatedItems = {
        ...prevItems,
        [isTotalView ? 'Total' : 'Mensal']: [...prevItems[isTotalView ? 'Total' : 'Mensal'], newItem]
      };
      // Atualiza o estado para indicar onde o item foi salvo e recarrega a visualização
      setItemSaved({ tableType: isTotalView ? 'Total' : 'Mensal' });
      return updatedItems;
    });
  };

  useEffect(() => {
    // Se um item foi salvo, força a atualização da tabela correta
    if (itemSaved) {
      // Atualiza o localStorage com a visualização atual
      localStorage.setItem('currentTableType', itemSaved.tableType);
      setIsTotalView(itemSaved.tableType === 'Total');
      setItemSaved(null); // Resetar o estado de item salvo
    }
  }, [itemSaved]);

  return (
    <>
      {/* Renderiza o Navbar e passa as funções necessárias como props */}
      <Navbar 
        toggleView={toggleView} 
        isTotalView={isTotalView}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        onFilter={handleFilter}
        onAddItem={openAddModal}
      />
      
      {/* Renderiza a tabela correta com base na visualização atual */}
      {isTotalView 
        ? <FinancialTableMov_Mensal searchTerm={searchTerm} filter={filter} items={items} /> 
        : <FinancialTableMov_Total searchTerm={searchTerm} filter={filter} items={items} />}
      
      {/* Renderiza o modal de adição de item com as props apropriadas */}
      <AddItemModal
      isOpen={isAddModalOpen}
      onClose={closeAddModal}
      onSave={handleSaveItem}
      tableType={isTotalView ? 'Mensal' : 'Total'}
      />
    </>
  );
}

export default App;