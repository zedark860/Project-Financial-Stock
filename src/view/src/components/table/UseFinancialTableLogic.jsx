import { useState, useEffect } from 'react';
import { Filter } from 'react-bootstrap-icons';

export const useFinancialTableLogic = ({ data, setData, searchTerm, filter, itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

  useEffect(() => {
    setData(data);
  }, [data, setData]);

  useEffect(() => {
    // Quando searchTerm ou filter mudam, reinicie a página atual para 1
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const sortedData = () => {
    const { key, direction } = sortConfig;
    if (!key) return data || [];

    return [...(data || [])].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });
  };

  const filteredData = () => {
    const normalizedSearchTerm = searchTerm ? searchTerm.toUpperCase() : '';
    const normalize = str => str ? str.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") : '';

    return sortedData().filter(item =>
      (filter === '' || normalize(item.setor) === normalize(filter)) &&
      Object.values(item).some(value => normalize(value ? value.toString() : '').includes(normalizedSearchTerm))
    );
  };

  const handlePageChange = (direction) => {
    setCurrentPage(prevPage => prevPage + direction);
  };

  const totalPages = Math.ceil((filteredData() || []).length / itemsPerPage);

  const getButtonStyle = (button) => {
    const isPrev = button === 'prev';
    const isNext = button === 'next';
    const isCurrentPage = (isPrev && currentPage === 1) || (isNext && currentPage >= totalPages);

    return {
      backgroundColor: isCurrentPage ? '#6c757d' : '#006C98',
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
    return (filteredData() || []).slice(startIndex, startIndex + itemsPerPage);
  };

  const confirmDelete = (item) => {
    setRowToDelete(item);
    setShowDeleteConfirm(true);
  };

  const deleteRow = () => {
    if (rowToDelete) {
      setData((data || []).filter(item => item.id !== rowToDelete.id));
    }
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
    setData((data || []).map(item => item.id === editedRowData.id ? editedRowData : item));
    setEditRow(null);
  };

  const cancelEdit = () => {
    setEditRow(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedRowData(prevData => ({ ...prevData, [name]: value }));
  };

  const getMovimentoColor = (movimento) => {
    switch (movimento) {
      case 'ENTRADA':
        return '#006C98';
      case 'SAÍDA':
        return '#971C1F';
      default:
        return '#E9CE2C';
    }
  };

  return {
    currentPage,
    totalPages,
    showDeleteConfirm,
    rowToDelete,
    editRow,
    editedRowData,
    currentData,
    handlePageChange,
    getButtonStyle,
    handleSort,
    getSortIcon,
    confirmDelete,
    deleteRow,
    cancelDelete,
    handleEdit,
    saveEdit,
    cancelEdit,
    handleInputChange,
    getMovimentoColor
  };
};
