import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import FinancialTableMov_Mensal from './FinancialTableMov_Mensal';
import AddItemModal from '../modalAddItem/AddItemModal';
import EditItemModal from '../modalEditItem/EditItemModal'; 
import { addItem, allItemsTableMensal, allItemsTableTotal, updateItem } from '../services/ApiFinancial';
import { toast } from 'react-toastify'; // Importa a biblioteca para notificações
import 'react-toastify/dist/ReactToastify.css'; // Importa o CSS para as notificações



function ParentComponent() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
  const [tableData, setTableData] = useState([]);
  const [isTotalView, setIsTotalView] = useState(true);
  const [tableType, setTableType] = useState('MOV_TOTAL');
  const [itemToEdit, setItemToEdit] = useState(null);

  useEffect(() => {
    setTableType(isTotalView ? 'MOV_TOTAL' : 'MOV_MENSAL');
  }, [isTotalView]);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const data = isTotalView ? await allItemsTableTotal() : await allItemsTableMensal();
        setTableData(data);
      } catch (error) {
        console.error('Erro ao carregar os dados da tabela:', error);
      }
    };

    fetchTableData();
  }, [isTotalView]);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openEditModal = (item) => {
    if (item && item.id) {
      setItemToEdit(item);
      setIsEditModalOpen(true);
    } else {
      console.error('Item para edição não encontrado ou não possui ID.');
    }
  };

  const closeEditModal = () => {
    setItemToEdit(null);
    setIsEditModalOpen(false);
  };

  const handleSave = async (formData) => {
    try {
      await addItem(formData, tableType === 'MOV_TOTAL' ? 'estoquefinanceiro_total' : 'estoquefinanceiro_mes');
      setIsAddModalOpen(false);
      const updatedData = isTotalView ? await allItemsTableTotal() : await allItemsTableMensal();
      setTableData(updatedData);

      // Exibe a notificação de sucesso
      toast.success('Item adicionado com sucesso!', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Erro ao adicionar o item:', error);

      // Exibe a notificação de erro
      toast.error('Erro ao adicionar o item. Tente novamente.', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  const handleEdit = async (formData) => {
    try {
      await updateItem(formData, tableType === 'MOV_TOTAL' ? 'estoquefinanceiro_total' : 'estoquefinanceiro_mes', formData.id);
      setIsEditModalOpen(false);
      const updatedData = isTotalView ? await allItemsTableTotal() : await allItemsTableMensal();
      setTableData(updatedData);

      // Exibe a notificação de sucesso
      toast.success('Item editado com sucesso!', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Erro ao editar o item:', error);

      // Exibe a notificação de erro
      toast.error('Erro ao editar o item. Tente novamente.', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 3000,
      });
    }
  };

  const toggleView = () => setIsTotalView(prevState => !prevState);

  return (
    <div>
      <Navbar
        toggleView={toggleView}
        isTotalView={isTotalView}
        onSearch={() => {}}
        onClearSearch={() => {}}
        onFilter={() => {}}
        onAddItem={openAddModal}
      />
      <FinancialTableMov_Mensal
        searchTerm=""
        filter=""
        data={tableData}
        onEditItem={openEditModal}
        onAddItem={openAddModal}
      />
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSave={handleSave}
        tableType={tableType}
      />
      {itemToEdit && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          item={itemToEdit}
          nameTable={tableType === 'MOV_TOTAL' ? 'estoquefinanceiro_total' : 'estoquefinanceiro_mes'}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}

export default ParentComponent;
