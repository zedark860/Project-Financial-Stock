import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addItem, updateQuantityTotal, allItemsTableTotal } from '../services/ApiFinancial';

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
    produtoSelecionado: '',
  });
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const result = await allItemsTableTotal();
        const sortedProducts = result.all?.sort((a, b) => a.produto.localeCompare(b.produto)) || [];
        setProdutos(sortedProducts);
      } catch (error) {
        console.error('Erro ao obter produtos:', error.message);
      }
    };

    fetchProdutos();
  }, []);

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
      if (!formData.entrada && formData.movimento === 'ENTRADA') newErrors.entrada = 'Entrada é obrigatória';
      if (!formData.saida && formData.movimento === 'SAÍDA') newErrors.saida = 'Saída é obrigatória';
      if (!formData.saldo) newErrors.saldo = 'Saldo Final é obrigatório';
      if (!formData.setor) newErrors.setor = 'Setor é obrigatório';
    }

    return newErrors;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (event) => {
    const { value } = event.target;
    const selectedProduct = produtos.find(produto => produto.id === value);
    if (selectedProduct) {
      setFormData(prevState => ({
        ...prevState,
        produtoSelecionado: value,
        produto: selectedProduct.produto,
      }));
    }
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

        // Atualiza a quantidade na tabela total
        const produtoSelecionado = produtos.find(produto => produto.id === formData.produtoSelecionado);
        if (produtoSelecionado) {
          await updateQuantityTotal(
            { produto: formData.produto, quantidade: formData.quantidade, movimento: formData.movimento },
            "estoquefinanceiro_total",
            produtoSelecionado.id,
            formData.movimento
          );
        }

        setShowSuccessModal(true);
        handleClose(); // Fechar o modal após sucesso
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
      setShowSuccessModal(true);
      handleClose(); // Fechar o modal após sucesso
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
      produtoSelecionado: '',
    });
    setErrors({});
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
    onClose();
  };

  return (
    <>
      <Modal show={isOpen} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Item ({tableType})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {tableType === 'Mensal' && (
              <>
                <Form.Group controlId="formProduto">
                  <Form.Label>Produto</Form.Label>
                  <Form.Control
                    as="select"
                    name="produtoSelecionado"
                    value={formData.produtoSelecionado}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.produto}
                      </option>
                    ))}
                  </Form.Control>
                  {errors.produto && <Form.Text className="text-danger">{errors.produto}</Form.Text>}
                </Form.Group>
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
                    onChange={handleInputChange}
                    required
                  >
                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SAÍDA">SAÍDA</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="formObservacao">
                  <Form.Label>Observação</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="observacao"
                    value={formData.observacao}
                    onChange={handleInputChange}
                    placeholder="Digite uma observação"
                  />
                </Form.Group>
              </>
            )}
            {tableType === 'Total' && (
              <>
                                <Form.Group controlId="formProduto">
                  <Form.Label>Produto</Form.Label>
                  <Form.Control
                    as="select"
                    name="produto"
                    value={formData.produto}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.produto}>
                        {produto.produto}
                      </option>
                    ))}
                  </Form.Control>
                  {errors.produto && <Form.Text className="text-danger">{errors.produto}</Form.Text>}
                </Form.Group>
                <Form.Group controlId="formUnidade">
                  <Form.Label>Unidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="unidade"
                    value={formData.unidade}
                    onChange={handleInputChange}
                    placeholder="Digite a unidade"
                    required
                  />
                  {errors.unidade && <Form.Text className="text-danger">{errors.unidade}</Form.Text>}
                </Form.Group>
                <Form.Group controlId="formEntrada">
                  <Form.Label>Entrada</Form.Label>
                  <Form.Control
                    type="number"
                    name="entrada"
                    value={formData.entrada}
                    onChange={handleInputChange}
                    placeholder="Digite a entrada"
                    min="0"
                  />
                  {errors.entrada && <Form.Text className="text-danger">{errors.entrada}</Form.Text>}
                </Form.Group>
                <Form.Group controlId="formSaida">
                  <Form.Label>Saída</Form.Label>
                  <Form.Control
                    type="number"
                    name="saida"
                    value={formData.saida}
                    onChange={handleInputChange}
                    placeholder="Digite a saída"
                    min="0"
                  />
                  {errors.saida && <Form.Text className="text-danger">{errors.saida}</Form.Text>}
                </Form.Group>
                <Form.Group controlId="formSaldo">
                  <Form.Label>Saldo Final</Form.Label>
                  <Form.Control
                    type="number"
                    name="saldo"
                    value={formData.saldo}
                    onChange={handleInputChange}
                    placeholder="Digite o saldo final"
                    min="0"
                    required
                  />
                  {errors.saldo && <Form.Text className="text-danger">{errors.saldo}</Form.Text>}
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
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmação */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>Você tem certeza de que deseja adicionar este item à tabela total?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmSave}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de sucesso */}
      <Modal show={showSuccessModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>Item adicionado com sucesso!</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de erro */}
      <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Erro</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowErrorModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddItemModal;

