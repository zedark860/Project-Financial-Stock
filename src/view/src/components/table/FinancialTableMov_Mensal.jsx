import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { PencilSquare, Trash } from 'react-bootstrap-icons';
import { useFinancialTableLogic } from './UseFinancialTableLogic';
import EditModal from '../modalEditor/ModalEditTableMensal';
import AddItemModal from '../modalAddItem/AddItemModal';
import { allItemsTableMensal, deleteItem,  addItem } from '../services/ApiFinancial';

function FinancialTableMov_Mensal({ searchTerm, filter }) {
  const [data, setData] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editedRowData, setEditedRowData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        const response = await allItemsTableMensal();
        setData(response.all);
      } catch (error) {
        console.error('Erro ao obter dados:', error);
      }
    }
    fetchData();
  }, []);

  const openEditModal = (item) => {
    console.log('Item selecionado para edição:', item); // Adicione esta linha
    setEditedRowData({ ...item }); // Clonar o item para garantir que o estado seja separado
    setIsEditModalOpen(true); // Abrir o modal de edição
  };
  

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    cancelEdit();
  };

  const handleSaveEdit = async (updatedItem) => {
    try {
      const updatedData = await allItemsTableMensal();
      setData(updatedData.all);
      closeEditModal();
    } catch (error) {
      console.error('Erro ao atualizar o item:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(deleteId, 'estoquefinanceiro_mes');
      const updatedData = await allItemsTableMensal();
      setData(updatedData.all);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Erro ao deletar o item:', error);
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
      await addItem(itemData, 'estoquefinanceiro_mes');
      const updatedData = await allItemsTableMensal();
      setData(updatedData.all);
      closeAddItemModal();
    } catch (error) {
      console.error('Erro ao adicionar o item:', error);
    }
  };

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th colSpan={10} className="table-title" style={{ backgroundColor: '#006C98', color: '#FCFCFC', textAlign: 'center' }}>
              MOV_MENSAL
            </th>
          </tr>
          <tr>
            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              ID {getSortIcon('id')}
            </th>
            <th onClick={() => handleSort('id_total')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              ID TOTAL {getSortIcon('id_total')}
            </th>
            <th onClick={() => handleSort('produto')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              PRODUTO {getSortIcon('produto')}
            </th>
            <th onClick={() => handleSort('quantidade')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              QUANTIDADE {getSortIcon('quantidade')}
            </th>
            <th onClick={() => handleSort('destino_origem')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              DESTINO/ORIGEM {getSortIcon('destino_origem')}
            </th>
            <th onClick={() => handleSort('responsavel')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              RESPONSÁVEL {getSortIcon('responsavel')}
            </th>            
            <th onClick={() => handleSort('movimento')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              MOVIMENTO {getSortIcon('movimento')}
            </th>
            <th onClick={() => handleSort('observacao')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              OBSERVAÇÃO {getSortIcon('observacao')}
            </th>
            <th onClick={() => handleSort('ultima_modificacao')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              ÚLTIMA MODIFICAÇÃO {getSortIcon('ultima_modificacao')}
            </th>
            <th style={{ textAlign: 'center' }}>ATUALIZAR</th>  {/* Antigamente podia deletar aqui também */}
          </tr>
        </thead>
        <tbody>
          {currentData().map((item) => (
            <tr key={item.id}>
              <td style={{ textAlign: 'center' }}>{item.id}</td>
              <td style={{ textAlign: 'center' }}>{item.id_total}</td>
              <td style={{ textAlign: 'center' }}>{item.produto}</td>
              <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
              <td style={{ textAlign: 'center' }}>{item.destino_origem}</td>
              <td style={{ textAlign: 'center' }}>{item.responsavel}</td>
              <td style={{ textAlign: 'center', backgroundColor: getMovimentoColor(item.movimento), color: 'white' }}>
                {item.movimento}
              </td>
              <td style={{ textAlign: 'center' }}>{item.observacao}</td>
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
                  onClick={() => openEditModal(item)}
                />
                {/* <Trash
                  className="action-icon"
                  style={{ cursor: 'pointer', color: '#FF0000' }}
                  onClick={() => {
                    setDeleteId(item.id);
                    setShowDeleteConfirm(true);
                  }}
                /> */}
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
      <EditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        item={editedRowData}
        nameTable="estoquefinanceiro_mes"
        onSave={handleSaveEdit}
      />


      {/* Modal para adição de item */}
      <AddItemModal
        show={isAddItemModalOpen}
        onClose={closeAddItemModal}
        onSave={handleAddItem}
      />

      {/* Modal de confirmação de exclusão */}
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

export default FinancialTableMov_Mensal;