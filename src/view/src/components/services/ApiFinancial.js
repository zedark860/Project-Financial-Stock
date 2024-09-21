const host = "http://192.168.88.252:3001"

// Tabela Mensal
// Função para deletar um item da tabela
export async function deleteItem(idProduct, nameTable) {
    try {
        const response = await fetch(`${host}/estoque/delete/${nameTable}/${idProduct}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao deletar o item da tabela');
        }
    } catch (error) {
        throw new Error(error.message || 'Erro ao realizar requisição ao servidor');
    }
}

// Função para atualizar um item da tabela
export async function updateItem(itemData, nameTable, id) {
    try {
      const response = await fetch(`${host}/estoque/update/${nameTable}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });
  
      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar o item da tabela');
      }
    } catch (error) {
      throw new Error(error.message || 'Erro ao realizar requisição ao servidor');
    }
  }
  

// Função para obter todos os itens da tabela
export async function allItemsTableMensal() {
    try {
        const response = await fetch(`${host}/estoque/all/estoquefinanceiro_mes`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao obter os itens da tabela mensal');
        }
    } catch (error) {
        throw new Error(error.message || 'Erro ao realizar requisição ao servidor');
    }
}

// Função para adicionar um novo item
// src/api.js
export async function addItem(itemData, nameTable) {
    try {
        console.log('Adicionando item:', itemData); // Verificar dados enviados
        const response = await fetch(`${host}/estoque/add/${nameTable}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(itemData),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Resposta do servidor:', result); // Verificar resposta do servidor
            return result;
        } else {
            const errorData = await response.json();
            console.error('Erro ao adicionar o item:', errorData.error || 'Erro desconhecido');
            throw new Error(errorData.error || 'Erro ao adicionar o item');
        }
    } catch (error) {
        console.error('Erro ao realizar a requisição:', error.message);
        throw error;
    }
}

// Tabela Total
// Função para obter todos os itens da tabela
export async function allItemsTableTotal() {
     try {
         const response = await fetch(`${host}/estoque/all/estoquefinanceiro_total`, {
             method: 'GET',
             credentials: 'include',
         });

         if (response.ok) {
             return await response.json();
         } else {
             const errorData = await response.json();
             throw new Error(errorData.error || 'Erro ao obter os itens da tabela total');
         }
     } catch (error) {
         throw new Error(error.message || 'Erro ao realizar requisição ao servidor');
     }
}
// Função para atualizar um item da tabela total com a operação de somar das quantidades da tabela mensal
export async function updateQuantityTotal(quantity, nameTable, id, typeMoviment) {
    try {
        const response = await fetch(`${host}/estoque/update-quantity-total/${nameTable}/${id}/${typeMoviment}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({quantity: quantity}),
        });
        if (response.ok) {
            return await response.json();
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar o item da tabela');
          }
    } catch (error) {
        throw new Error(error.message || 'Erro ao realizar requisição ao servidor');
    }    
}