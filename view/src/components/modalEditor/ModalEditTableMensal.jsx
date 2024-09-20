import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { updateItem, updateQuantityTotal } from '../services/ApiFinancial';

function normalizeText(text) {
  let normalized = text.toUpperCase();
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  normalized = normalized.replace(/Ç/g, "C");
  return normalized;
}

const EditItemModalTotal = ({ isOpen, onClose, item, nameTable, onSave }) => {
  const [formData, setFormData] = useState({
    id: item?.id || '',
    produto: item?.produto || '',
    quantidade: item?.quantidade || '',
    destino_origem: item?.destino_origem || '',
    responsavel: item?.responsavel || '',
    movimento: item?.movimento || 'ENTRADA',
  });

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const normalizedValue = normalizeText(value);
    setFormData(prevState => ({
      ...prevState,
      [name]: normalizedValue
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nameTable || !formData.id) {
      console.error('Nome da tabela ou ID do item não fornecidos.');
      alert('Erro: Nome da tabela ou ID do item não fornecidos.');
      return;
    }

    try {
      // Atualiza o item na tabela mensal
      await updateItem(formData, nameTable, formData.id);

      // Atualiza a quantidade na tabela total, se necessário
      // Você pode adicionar mais validações conforme necessário
      if (nameTable === 'Mensal') {
        const dataItens = {
          produto: formData.produto,
          quantidade: formData.quantidade,
          movimento: formData.movimento,
        };
        await updateQuantityTotal(dataItens, 'Total', formData.id, formData.movimento);
      }

      onSave(formData); // Callback para atualizar a lista na tela
      onClose(); // Fecha o modal
    } catch (error) {
      console.error('Erro ao atualizar o item:', error);
    }
  };

  if (!isOpen) return null;

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
          <Form.Group controlId="formProduto">
            <Form.Label>ID Total</Form.Label>
            <Form.Control
              type="text"
              name="idTotal"
              value={formData.id_total || ""}
              onChange={handleInputChange}
              required
              disabled
            />
          </Form.Group>
          <Form.Group controlId="formQuantidade">
            <Form.Label>Quantidade</Form.Label>
            <Form.Control
              type="number"
              name="quantidade"
              value={formData.quantidade || ""}
              onChange={handleInputChange}
              placeholder="Digite a quantidade"
              required
              min={0}
            />
          </Form.Group>
          <Form.Group controlId="formDestinoOrigem">
            <Form.Label>Destino/Origem</Form.Label>
            <Form.Control
              type="text"
              name="destino_origem"
              value={formData.destino_origem || ""}
              onChange={handleInputChange}
              placeholder="Digite o destino ou origem"
            />
          </Form.Group>
          <Form.Group controlId="formResponsavel">
            <Form.Label>Responsável</Form.Label>
            <Form.Control
              type="text"
              name="responsavel"
              value={formData.responsavel || ""}
              onChange={handleInputChange}
              placeholder="Digite o responsável"
            />
          </Form.Group>
          <Form.Group controlId="formMovimento">
            <Form.Label>Movimento</Form.Label>
            <Form.Control
              as="select"
              name="movimento"
              value={formData.movimento || "ENTRADA"}
              onChange={handleInputChange}
            >
              <option value="ENTRADA">ENTRADA</option>
              <option value="SAIDA">SAÍDA</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="formObservacao">
            <Form.Label>Observação</Form.Label>
            <Form.Control
              type="text"
              name="observacao"
              value={formData.observacao || ""}
              onChange={handleInputChange}
              placeholder="Digite a observação"
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

export default EditItemModalTotal;