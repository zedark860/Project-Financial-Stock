import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { updateItem } from '../services/ApiFinancial';

// Função de normalização
function normalizeText(text) {
  // Converter para maiúsculas
  let normalized = text.toUpperCase();

  // Remover acentos e substituir "ç" por "c"
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove diacríticos (acentos)
  normalized = normalized.replace(/Ç/g, "C"); // Substitui "Ç" por "C"

  return normalized;
}

const EditItemModal = ({ isOpen, onClose, item, nameTable, onSave }) => {
  const [formData, setFormData] = useState({
    id: item?.id || '',
    produto: item?.produto || '',
    vencimento: item?.vencimento || '',
    unidade: item?.unidade || '',
    entrada: item?.entrada || '',
    saida: item?.saida || '',
    saldo: item?.saldo || '',
    setor: item?.setor || '',
  });

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const normalizedValue = normalizeText(value);
  
    setFormData(prevState => {
      const entrada = parseFloat(name === 'entrada' ? normalizedValue : prevState.entrada) || 0;
      const saida = parseFloat(name === 'saida' ? value : prevState.saida) || 0;
  
      // Não alterar o valor de saida se o movimento for 'ENTRADA'
      const adjustedSaida = entrada < saida ? entrada : saida;
      const saldo = entrada === adjustedSaida ? 0 : entrada - adjustedSaida;
  
      return {
        ...prevState,
        [name]: normalizedValue,
        saida: adjustedSaida,
        saldo: Math.round(Math.max(0, saldo)),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const entrada = parseFloat(formData.entrada);
    const saida = parseFloat(formData.saida);

    // Verifica se a entrada e saída são números não negativos
    if (entrada < 0 || saida < 0) {
      alert('Entrada e saída devem ser números não negativos.');
      return;
    }

    // Verifica se a saída não é maior que a entrada
    if (saida > entrada) {
      alert('A saída não pode ser maior que a entrada.');
      return;
    }

    if (!nameTable || !formData.id) {
      console.error('Nome da tabela ou ID do item não fornecidos.');
      alert('Erro: Nome da tabela ou ID do item não fornecidos.');
      return;
    }

    try {
      await updateItem(formData, nameTable, formData.id);
      onSave(formData); // Callback para atualizar a lista na tela
      onClose(); // Fecha o modal
      window.location.reload(); // Recarrega a página após a atualização
    } catch (error) {
      console.error('Erro ao atualizar o item:', error);
    }
  };

  if (!isOpen) return null;

  const entrada = parseFloat(formData.entrada) || 0;
  const saida = parseFloat(formData.saida) || 0;
  const isEntradaIgualSaida = entrada === saida;

  return (
    <Modal show={isOpen} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formProduto">
            <Form.Label>Produto</Form.Label>
            <Form.Control
              type="text"
              name="produto"
              value={formData.produto || ""}
              onChange={handleInputChange}
              placeholder="Digite o nome do produto"
              required
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formVencimento">
            <Form.Label>Vencimento</Form.Label>
            <Form.Control
              type="date"
              name="vencimento"
              value={formData.vencimento || ""}
              onChange={handleInputChange}
              placeholder="Digite o vencimento"
            />
          </Form.Group>
          <Form.Group controlId="formLote">
            <Form.Label>Unidade</Form.Label>
            <Form.Control
              type="text"
              name="unidade"
              value={formData.unidade || ""}
              onChange={handleInputChange}
              placeholder="Digite a Unidade"
              required
            />
          </Form.Group>
          <Form.Group controlId="formEntrada">
            <Form.Label>Entrada</Form.Label>
            <Form.Control
              type="number"
              name="entrada"
              value={formData.entrada || ""}
              onChange={handleInputChange}
              placeholder="Digite a entrada"
              required
              min="0" // Previne a entrada de números negativos
            />
          </Form.Group>
          <Form.Group controlId="formSaida">
                  <Form.Label>Saída</Form.Label>
                  <Form.Control
                    type="number"
                    name="saida"
                    value={formData.saida || ""}
                    onChange={(e) => {
                      const newValue  = parseFloat(e.target.value);
                      if (isEntradaIgualSaida && newValue > entrada) {
                        // Se o valor de saída for maior que a entrada, não permite o aumento
                        return;
                      }
                      handleInputChange(e);
                    }}
                    placeholder="Digite a saída"
                    // required
                    min="0"
                    
                  />
                </Form.Group>
          <Form.Group controlId="formSaldo">
            <Form.Label>Saldo</Form.Label>
            <Form.Control
              type="number"
              name="saldo"
              value={formData.saldo || ""}
              placeholder="0"
              disabled // Não permite edição do saldo diretamente
            />
          </Form.Group>
          <Form.Group controlId="formSetor">
            <Form.Label>Setor</Form.Label>
            <Form.Control
              type="text"
              name="setor"
              value={formData.setor || ""}
              onChange={handleInputChange}
              placeholder="Digite o setor"
            />
          </Form.Group>
          <div className='d-flex justify-content-around'>
            <Button size='md' type="submit" style={{ marginRight: '10px', marginTop: '10px', backgroundColor: '#006C98', color: 'white', borderColor: '#006C98' }}>
              Salvar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditItemModal;
