import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import { useFinancialTableLogic } from './UseFinancialTableLogic';
import EditItemModal from '../modalEditor/ModalEditTableTotal.jsx';
import AddItemModal from '../modalAddItem/AddItemModal';
import { allItemsTableTotal, deleteItem, updateItem, addItem } from '../services/ApiFinancial';

function FinancialTableMov_Total({ searchTerm, filter }) {
  const [data, setData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editedRowData, setEditedRowData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState(''); // Estado para mensagem de erro

  const {
    currentData,
    currentPage,
    totalPages,
    handlePageChange,
    getButtonStyle,
    handleSort,
    getSortIcon,
    confirmDelete,
    deleteRow,
    cancelDelete,
    handleEdit,
    cancelEdit,
    handleInputChange,
    getMovimentoColor,
  } = useFinancialTableLogic({
    data,
    setData,
    searchTerm,
    filter,
    itemsPerPage: 10,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await allItemsTableTotal();
        setData(result.all);
      } catch (error) {
        console.error('Erro ao obter dados:', error);
        setAlertMessage('Erro ao obter dados.');
        setTimeout(() => setAlertMessage(''), 5000); // Remove a mensagem após 5 segundos
      }
    }
    fetchData();
  }, []);

  const openEditModalTotal = (item) => {
    setEditedRowData(item);
    setIsEditModalOpen(true);
  };

  const closeEditModalTotal = () => {
    setIsEditModalOpen(false);
    setEditedRowData(null);
  };

  const handleSaveEdit = async (updatedItem) => {
    try {
      await updateItem(updatedItem.id, updatedItem, 'estoquefinanceiro_total');
      const updatedData = await allItemsTableTotal();
      setData(updatedData.all);
      closeEditModalTotal();
      setAlertMessage('');
    } catch (error) {
      console.error('Erro ao atualizar o item:', error);
      setAlertMessage(error.response?.data?.error || 'Erro desconhecido ao atualizar o item.');
      setTimeout(() => setAlertMessage(''), 5000); // Remove a mensagem após 5 segundos
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteId, 'estoquefinanceiro_total');
      const updatedData = await allItemsTableTotal();
      setData(updatedData.all);
      setShowDeleteConfirm(false);
      setAlertMessage('');
    } catch (error) {
      console.error('Erro ao deletar o item:', error);
      setAlertMessage(error.response?.data?.error || 'Item presente na tabela mensal. Para removê-lo da tabela total, exclua-o primeiro da tabela mensal');
      setTimeout(() => setAlertMessage(''), 5000); // Remove a mensagem após 5 segundos
    }
  };

  const openAddItemModal = () => {
    setIsAddItemModalOpen(true);
  };

  const closeAddItemModal = () => {
    setIsAddItemModalOpen(false);
  };

  const handleAddItem = async (itemData) => {
    try {
      await addItem(itemData, 'estoquefinanceiro_total');
      const updatedData = await allItemsTableTotal();
      setData(updatedData.all);
      closeAddItemModal();
      setAlertMessage('');
    } catch (error) {
      console.error('Erro ao adicionar o item:', error);
      setAlertMessage(error.response?.data?.error || 'Erro desconhecido ao adicionar o item.');
      setTimeout(() => setAlertMessage(''), 5000); // Remove a mensagem após 5 segundos
    }
  };

  return (
    <>
      {alertMessage && (
        <div className="alert alert-danger" style={{ marginBottom: '20px', textAlign: 'center', position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 1050 }}>
          {alertMessage}
        </div>
      )}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th colSpan={11} className="table-title" style={{ backgroundColor: '#006C98', color: '#FCFCFC', textAlign: 'center' }}>
              MOV_TOTAL
            </th>
          </tr>
          <tr>
            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              ID {getSortIcon('id')}
            </th>
            <th onClick={() => handleSort('produto')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              PRODUTO {getSortIcon('produto')}
            </th>
            <th onClick={() => handleSort('vencimento')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              VENCIMENTO {getSortIcon('vencimento')}
            </th>
            <th onClick={() => handleSort('unidade')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              UNIDADE {getSortIcon('unidade')}
            </th>
            <th onClick={() => handleSort('entrada')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              ENTRADA {getSortIcon('entrada')}
            </th>
            <th onClick={() => handleSort('saida')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              SAÍDA {getSortIcon('saida')}
            </th>
            <th onClick={() => handleSort('saldo')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              SALDO FINAL {getSortIcon('saldo')}
            </th>
            <th onClick={() => handleSort('setor')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              SETOR {getSortIcon('setor')}
            </th>
            <th onClick={() => handleSort('ultima_modificacao')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              ÚLTIMA MODIFICAÇÃO {getSortIcon('ultima_modificacao')}
            </th>
            <th style={{ textAlign: 'center' }}>ATUALIZAR/DELETAR</th>
          </tr>
        </thead>
        <tbody>
          {currentData().map((item) => (
            <tr key={item.id}>
              <td style={{ textAlign: 'center' }}>{item.id}</td>
              <td style={{ textAlign: 'center' }}>{item.produto}</td>
              <td style={{ textAlign: 'center' }}>{new Date(item.vencimento).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}</td>
              <td style={{ textAlign: 'center' }}>{item.unidade}</td>
              <td style={{ textAlign: 'center', backgroundColor: '#006C98', color: '#FCFCFC' }}>{item.entrada}</td>
              <td style={{ textAlign: 'center', backgroundColor: '#971C1F', color: '#FCFCFC' }}>{item.saida}</td>
              <td style={{ textAlign: 'center', backgroundColor: '#C2B600', color: '#FCFCFC' }}>{item.saldo}</td>
              <td style={{ textAlign: 'center' }}>{item.setor}</td>
              <td style={{ textAlign: 'center' }}>
                {new Date(item.data_modificacao).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })}
              </td>
              <td style={{ textAlign: 'center' }}>
                <PencilSquare
                  className="action-icon"
                  style={{ cursor: 'pointer', marginRight: '10px', color: '#006C98' }}
                  onClick={() => openEditModalTotal(item)}
                />
                <Trash
                  className="action-icon"
                  style={{ cursor: 'pointer', color: '#FF0000' }}
                  onClick={() => {
                    setDeleteId(item.id);
                    setShowDeleteConfirm(true);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          Página {currentPage} de {totalPages}
        </div>
        <div>
          <button
            onClick={() => handlePageChange(-1)}
            disabled={currentPage === 1}
            style={getButtonStyle('prev')}
          >
            Anterior
          </button>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage >= totalPages}
            style={getButtonStyle('next')}
          >
            Próximo
          </button>
        </div>
      </div>

      {/* Modal para edição de item */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={closeEditModalTotal}
        onSave={handleSaveEdit}
        nameTable="estoquefinanceiro_total"
        item={editedRowData}
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050 }}
      />

      {/* Modal para adicionar item */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={closeAddItemModal}
        onSave={handleAddItem}
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1050 }}
      />

      {showDeleteConfirm && (
        <div className="delete-confirm-modal" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', zIndex: 1000 }}>
          <p>Tem certeza de que deseja excluir este item?</p>
          <button style={{ marginRight: '10px', border: 'none', backgroundColor: '#006C98', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }} onClick={handleDelete}>Sim</button>
          <button style={{ border: 'none', backgroundColor: '#FF0000', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }} onClick={() => setShowDeleteConfirm(false)}>Não</button>
        </div>
      )}
    </>
  );
}

export default FinancialTableMov_Total;
