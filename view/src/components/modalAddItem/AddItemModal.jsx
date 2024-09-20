import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addItem } from '../services/ApiFinancial';

function AddItemModal({ isOpen, onClose, tableType }) {
  const [formData, setFormData] = useState({
    produto: '',
    quantidade: '',
    destino_origem: '',
    responsavel: '',
    movimento: 'ENTRADA',
    unidade: '',
    vencimento: '',
    entrada: '',
    saida: '',
    saldo: '',
    setor: '',
  });

  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.produto) newErrors.produto = 'Produto é obrigatório';

    if (tableType === "Mensal") {
      if (!formData.quantidade) newErrors.quantidade = 'Quantidade é obrigatória';
      if (!formData.responsavel) newErrors.responsavel = 'Responsável é obrigatório';
      if (!formData.destino_origem) newErrors.destino_origem = 'Destino/Origem é obrigatório';
    } 
    
    if (tableType === "Total") {
      if (!formData.unidade) newErrors.unidade = 'Unidade é obrigatória';
      // if (!formData.vencimento) newErrors.vencimento = 'Vencimento é obrigatório';
      if (!formData.entrada && formData.movimento === 'ENTRADA') newErrors.entrada = 'Entrada é obrigatória';
      if (!formData.saida && formData.movimento === 'SAÍDA') newErrors.saida = 'Saída é obrigatória';
      if (!formData.saldo) newErrors.saldo = 'Saldo Final é obrigatório';
      if (!formData.setor) newErrors.setor = 'Setor é obrigatório';
    }

    return newErrors;
  };

  function normalizeText(text) {
    let normalized = text.toUpperCase();
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    normalized = normalized.replace(/Ç/g, "C");
    return normalized;
  }
  
  
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
  

  const handleMovementChange = (event) => {
    const { value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      movimento: value,
      entrada: value === 'ENTRADA' ? prevState.entrada : '',
      saida: value === 'SAÍDA' ? prevState.saida : '',
      saldo: value === 'ENTRADA' ? prevState.entrada - prevState.saida : prevState.entrada,
    }));
  };
  

  const handleSave = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
  
    if (tableType === 'Total') {
      setShowConfirmModal(true);
    } else {
      try {
        const result = await addItem(formData, "estoquefinanceiro_mes");
        console.log('Item adicionado com sucesso:', result);
        setShowSuccessModal(true);
        window.location.reload(); // Recarrega a página após o sucesso
      } catch (error) {
        console.error('Erro ao salvar o item:', error.message);
        const itemName = formData.produto;
        const message = error.message.includes('Já existe um item com o nome')
          ? error.message
          : `Já existe um item com o nome "${itemName}" na tabela mensal.`;
        setErrorMessage(message);
        setShowErrorModal(true);
      }
    }
  };
  
  const confirmSave = async () => {
    try {
      const result = await addItem(formData, "estoquefinanceiro_total");
      console.log('Item adicionado com sucesso:', result);
      window.location.reload(); // Recarrega a página após o sucesso
    } catch (error) {
      console.error('Erro ao salvar o item:', error.message);
      const itemName = formData.produto;
      const message = error.message.includes('Já existe um item com o nome')
        ? error.message
        : `Já existe um item com o nome "${itemName}" na tabela total.`;
      setErrorMessage(message);
      setShowErrorModal(true);
    }
  };

  const handleClose = () => {
    setFormData({
      produto: '',
      quantidade: '',
      destino_origem: '',
      responsavel: '',
      movimento: 'ENTRADA',
      unidade: '',
      vencimento: '',
      entrada: '',
      saida: '',
      saldo: '',
      setor: '',
    });
    setErrors({});
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
    onClose();
  };

  const entrada = parseFloat(formData.entrada) || 0;
  const saida = parseFloat(formData.saida) || 0;
  const isEntradaIgualSaida = entrada === saida;

  return (
    <>
      <Modal show={isOpen} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Item ({tableType})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProduto">
              <Form.Label>Produto</Form.Label>
              <Form.Control
                type="text"
                name="produto"
                value={formData.produto}
                onChange={handleInputChange}
                placeholder="Digite o nome do produto"
                required
              />
              {errors.produto && <Form.Text className="text-danger">{errors.produto}</Form.Text>}
            </Form.Group>

            {tableType === 'Mensal' && (
              <>
                <Form.Group controlId="formQuantidade">
                  <Form.Label>Quantidade</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantidade"
                    value={formData.quantidade}
                    onChange={handleInputChange}
                    placeholder="Digite a quantidade"
                    required
                    min="0"
                  />
                  {errors.quantidade && <Form.Text className="text-danger">{errors.quantidade}</Form.Text>}
                </Form.Group>
                <Form.Group controlId="formDestinoOrigem">
                  <Form.Label>Destino/Origem</Form.Label>
                  <Form.Control
                    type="text"
                    name="destino_origem"
                    value={formData.destino_origem}
                    onChange={handleInputChange}
                    placeholder="Digite o destino ou origem"
                    required
                  />
                  {errors.destino_origem && <Form.Text className="text-danger">{errors.destino_origem}</Form.Text>}
                </Form.Group>
                <Form.Group controlId="formResponsavel">
                  <Form.Label>Responsável</Form.Label>
                  <Form.Control
                    type="text"
                    name="responsavel"
                    value={formData.responsavel}
                    onChange={handleInputChange}
                    placeholder="Digite o responsável"
                    required
                  />
                  {errors.responsavel && <Form.Text className="text-danger">{errors.responsavel}</Form.Text>}
                </Form.Group>
                <Form.Group controlId="formMovimento">
                  <Form.Label>Movimento</Form.Label>
                  <Form.Control
                    as="select"
                    name="movimento"
                    value={formData.movimento}
                    onChange={handleMovementChange}
                    required
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
                    value={formData.observacao}
                    onChange={handleInputChange}
                    placeholder="Digite a observação"
                    required
                  />
                  {errors.observacao && <Form.Text className="text-danger">{errors.observacao}</Form.Text>}
                </Form.Group>
              </>
            )}

            {tableType === 'Total' && (
              <>
                <Form.Group controlId="formUnidade">
                  <Form.Label>Unidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="unidade"
                    value={formData.unidade}
                    onChange={handleInputChange}
                    placeholder="Digite a Unidade"
                    required
                  />
                  {errors.unidade && <Form.Text className="text-danger">{errors.unidade}</Form.Text>}
                </Form.Group>
                <Form.Group controlId="formVencimento">
                  <Form.Label>Vencimento</Form.Label>
                  <Form.Control
                    type="date"
                    name="vencimento"
                    value={formData.vencimento}
                    onChange={handleInputChange}
                    placeholder="Digite o vencimento"
                  />
                  {errors.vencimento && <Form.Text className="text-danger">{errors.vencimento}</Form.Text>}
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
                    min="0"
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
                    placeholder="0"
                    required
                    min="0"
                    readOnly
                    disabled
                    
                  />
                </Form.Group>
                <Form.Group controlId="formSaldo">
                  <Form.Label>Saldo</Form.Label>
                  <Form.Control
                    type="number"
                    name="saldo"
                    value={formData.saldo || ""}
                    placeholder="0"
                    readOnly
                    disabled
                  />
                </Form.Group>
                <Form.Group controlId="formSetor">
                  <Form.Label>Setor</Form.Label>
                  <Form.Control
                    type="text"
                    name="setor"
                    value={formData.setor}
                    onChange={handleInputChange}
                    placeholder="Digite o setor"
                    required
                  />
                  {errors.setor && <Form.Text className="text-danger">{errors.setor}</Form.Text>}
                </Form.Group>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{backgroundColor: '#006C98', color: 'white', borderColor: '#006C98'}} onClick={handleSave}>Salvar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Adição</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza de que deseja adicionar o item à tabela total?
        </Modal.Body>
        <Modal.Footer>
          <Button style={{backgroundColor: '#006C98', color: 'white', borderColor: '#006C98'}} onClick={confirmSave}>Confirmar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSuccessModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{backgroundColor: '#006C98', color: 'white'}}>Item adicionado com sucesso!</Modal.Body>
        <Modal.Footer>
          {/* <Button variant="primary" onClick={handleClose}>Fechar</Button> */}
        </Modal.Footer>
      </Modal>

      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{color: '#971C1F'}}>Erro</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button style={{backgroundColor: '#006C98', color: 'white', borderColor: '#006C98'}} onClick={() => setShowErrorModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddItemModal;
