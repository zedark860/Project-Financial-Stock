import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Filter, PencilSquare, Trash } from 'react-bootstrap-icons';

function FinancialTableMov_Total({ searchTerm, filter, clearFilter }) {
  const [data, setData] = useState([
    { id: '#2587', produto: 'PAPEL', lote: 'PCT', vencimento: '20/10/2024', entrada: 20, saida: 0, saldoFinal: 20, setor: 'FINANCEIRO' },
    { id: '#2789', produto: 'MOUSE', lote: 'UNIDADE', vencimento: '20/09/2025', entrada: 1, saida: 0, saldoFinal: 1, setor: 'FINANCEIRO' },
    { id: '#3782', produto: 'CAFÉ', lote: 'PCT', vencimento: '18/10/2026', entrada: 3, saida: 0, saldoFinal: 3, setor: 'FINANCEIRO' },
    { id: '#3782', produto: 'CAFÉ', lote: 'PCT', vencimento: '18/10/2026', entrada: 3, saida: 0, saldoFinal: 3, setor: 'FINANCEIRO' },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});
  const itemsPerPage = 10;

  const sortedData = () => {
    const { key, direction } = sortConfig;
    if (!key) return data;

    return [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  const filteredData = () => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const normalize = str => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");

    return sortedData().filter(item =>
      (filter === '' || normalize(item.setor) === normalize(filter)) &&
      Object.values(item).some(value => normalize(value.toString()).includes(normalizedSearchTerm))
    );
  };

  const handlePageChange = (direction) => {
    setCurrentPage(prevPage => prevPage + direction);
  };

  const totalPages = Math.ceil(filteredData().length / itemsPerPage);

  const getButtonStyle = (button) => {
    const isPrev = button === 'prev';
    const isNext = button === 'next';
    const isCurrentPage = (isPrev && currentPage === 1) || (isNext && currentPage >= totalPages);

    return {
      backgroundColor: isCurrentPage ? '#6c757d' : '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      padding: '5px 10px',
      cursor: 'pointer',
      marginRight: isPrev ? '10px' : '0'
    };
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => {
      const newDirection = prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending';
      return { key, direction: newDirection };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <Filter style={{ transform: 'rotate(180deg)' }} /> : <Filter />;
    }
    return <Filter />;
  };

  const currentData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData().slice(startIndex, startIndex + itemsPerPage);
  };

  const confirmDelete = (item) => {
    setRowToDelete(item);
    setShowDeleteConfirm(true);
  };

  const deleteRow = () => {
    setData(data.filter(item => item.id !== rowToDelete.id));
    setShowDeleteConfirm(false);
    setRowToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRowToDelete(null);
  };

  const handleEdit = (item) => {
    setEditRow(item.id);
    setEditedRowData(item);
  };

  const saveEdit = () => {
    setData(data.map(item => item.id === editedRowData.id ? editedRowData : item));
    setEditRow(null);
  };

  const cancelEdit = () => {
    setEditRow(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRowData(prevData => ({ ...prevData, [name]: value }));
  };

  return (
    <>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th colSpan={9} className="table-title" style={{ backgroundColor: '#006C98', color: '#FCFCFC', textAlign: 'center' }}>MOV_TOTAL</th>
          </tr>
          <tr>
            <th onClick={() => handleSort('id')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              ID {getSortIcon('id')}
            </th>
            <th onClick={() => handleSort('produto')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              PRODUTO {getSortIcon('produto')}
            </th>
            <th onClick={() => handleSort('lote')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              LOTE {getSortIcon('lote')}
            </th>
            <th onClick={() => handleSort('vencimento')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              VENCIMENTO {getSortIcon('vencimento')}
            </th>
            <th onClick={() => handleSort('entrada')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              ENTRADA {getSortIcon('entrada')}
            </th>
            <th onClick={() => handleSort('saida')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              SAÍDA {getSortIcon('saida')}
            </th>
            <th onClick={() => handleSort('saldoFinal')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              SALDO FINAL {getSortIcon('saldoFinal')}
            </th>
            <th onClick={() => handleSort('setor')} style={{ cursor: 'pointer', textAlign: 'center' }}>
              SETOR {getSortIcon('setor')}
            </th>
            <th style={{ textAlign: 'center' }}>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {currentData().map((item) => (
            <tr key={item.id}>
              <td style={{ textAlign: 'center' }}>
                {editRow === item.id ? (
                  <input
                    type="text"
                    name="id"
                    value={editedRowData.id}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  item.id
                )}
              </td>
              <td style={{ textAlign: 'center' }}>
                {editRow === item.id ? (
                  <input
                    type="text"
                    name="produto"
                    value={editedRowData.produto}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  item.produto
                )}
              </td>
              <td style={{ textAlign: 'center' }}>
                {editRow === item.id ? (
                  <input
                    type="text"
                    name="lote"
                    value={editedRowData.lote}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  item.lote
                )}
              </td>
              <td style={{ textAlign: 'center' }}>
                {editRow === item.id ? (
                  <input
                    type="text"
                    name="vencimento"
                    value={editedRowData.vencimento}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  item.vencimento
                )}
              </td>
              <td style={{ textAlign: 'center', backgroundColor: '#006C98', color: '#FCFCFC' }}>
                {editRow === item.id ? (
                  <input
                    type="number"
                    name="entrada"
                    value={editedRowData.entrada}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  item.entrada
                )}
              </td>
              <td style={{ textAlign: 'center', backgroundColor: '#971C1F', color: '#FCFCFC' }}>
                {editRow === item.id ? (
                  <input
                    type="number"
                    name="saida"
                    value={editedRowData.saida}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  item.saida
                )}
              </td>
              <td style={{ textAlign: 'center', backgroundColor: '#C2B600', color: '#FCFCFC' }}>
                {editRow === item.id ? (
                  <input
                    type="number"
                    name="saldoFinal"
                    value={editedRowData.saldoFinal}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  item.saldoFinal
                )}
              </td>
              <td style={{ textAlign: 'center' }}>
                {editRow === item.id ? (
                  <input
                    type="text"
                    name="setor"
                    value={editedRowData.setor}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                  />
                ) : (
                  item.setor
                )}
              </td>
              <td style={{ textAlign: 'center' }}>
                {editRow === item.id ? (
                  <>
                    <button
                      onClick={saveEdit}
                      style={{ background: 'none', border: 'none', color: '#006C98', marginRight: '10px' }}
                    >
                      <PencilSquare />
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{ background: 'none', border: 'none', color: '#971C1F' }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{ background: 'none', border: 'none', color: '#006C98', marginRight: '10px' }}
                    >
                      <PencilSquare />
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      style={{ background: 'none', border: 'none', color: '#971C1F' }}
                    >
                      <Trash />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <p>Tem certeza de que deseja excluir este item?</p>
          <button onClick={deleteRow} style={{ backgroundColor: '#971C1F', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer', marginRight: '10px' }}>
            Confirmar
          </button>
          <button onClick={cancelDelete} style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      )}

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
    </>
  );
}

export default FinancialTableMov_Total;