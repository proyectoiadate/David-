/**
 * OpenAPI 3.0.3 Specification
 * Especificación formal completa de la API REST v1 para la plataforma financiera.
 */

export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'FinanzaFamiliar API',
    description: 'API REST versionada para la gestión integral de finanzas personales y familiares.',
    version: '1.0.0',
    contact: {
      name: 'Equipo de Arquitectura e Ingeniería',
      email: 'soporte@finanzafamiliar.io'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Servidor Principal (Entorno Local y Producción)'
    }
  ],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Autenticación de usuario con correo/contraseña o proveedor OAuth',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  provider: { type: 'string', enum: ['LOCAL', 'GOOGLE', 'MICROSOFT'] }
                },
                required: ['email']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Sesión iniciada con token JWT y refresh token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '401': { description: 'Credenciales inválidas' }
        }
      }
    },
    '/transactions': {
      get: {
        summary: 'Listar movimientos con filtros y paginación',
        tags: ['Movimientos'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'accountId', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'visibility', in: 'query', schema: { type: 'string', enum: ['PRIVATE', 'SHARED', 'FAMILY'] } }
        ],
        responses: {
          '200': {
            description: 'Lista paginada de movimientos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Registrar un nuevo movimiento financiero',
        tags: ['Movimientos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewTransactionRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Movimiento creado y saldos afectados automáticamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Transaction' }
              }
            }
          },
          '400': { description: 'Campos requeridos faltantes o inválidos' }
        }
      }
    },
    '/accounts': {
      get: {
        summary: 'Listar cuentas financieras activas',
        tags: ['Cuentas'],
        responses: {
          '200': {
            description: 'Lista de cuentas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Account' }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Crear una nueva cuenta',
        tags: ['Cuentas'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewAccountRequest' }
            }
          }
        },
        responses: {
          '201': { description: 'Cuenta creada' }
        }
      }
    },
    '/credit-cards': {
      get: {
        summary: 'Listar tarjetas de crédito con estados de corte y cupo',
        tags: ['Tarjetas'],
        responses: {
          '200': {
            description: 'Lista de tarjetas',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/CreditCard' } }
              }
            }
          }
        }
      }
    },
    '/debts': {
      get: {
        summary: 'Listar deudas y préstamos',
        tags: ['Deudas'],
        responses: {
          '200': {
            description: 'Lista de deudas',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Debt' } }
              }
            }
          }
        }
      }
    },
    '/debts/simulate-extra-payment': {
      post: {
        summary: 'Simular abonos extraordinarios a una deuda',
        tags: ['Deudas'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  debtId: { type: 'string' },
                  oneTimeExtraPayment: { type: 'number' },
                  monthlyExtraPayment: { type: 'number' }
                },
                required: ['debtId']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Resultado de simulación con intereses y meses ahorrados',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    interestSaved: { type: 'number' },
                    monthsSaved: { type: 'integer' },
                    newPayoffDate: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/debts/strategy-comparison': {
      get: {
        summary: 'Comparar estrategias Bola de Nieve (Snowball) vs Avalancha (Avalanche)',
        tags: ['Deudas'],
        parameters: [
          { name: 'extraBudget', in: 'query', schema: { type: 'number', default: 200 } }
        ],
        responses: {
          '200': { description: 'Comparativa de liquidación de deuda' }
        }
      }
    },
    '/budgets': {
      get: {
        summary: 'Listar presupuestos con % de avance y estado de alerta',
        tags: ['Presupuestos'],
        responses: { '200': { description: 'Lista de presupuestos' } }
      }
    },
    '/goals': {
      get: {
        summary: 'Listar metas de ahorro y avance porcentual',
        tags: ['Metas'],
        responses: { '200': { description: 'Lista de metas' } }
      }
    },
    '/analytics/insights': {
      get: {
        summary: 'Ejecutar motor analítico financiero MVP (detección de patrones y recomendaciones)',
        tags: ['Analítica'],
        responses: { '200': { description: 'Lista de hallazgos y sugerencias de optimización' } }
      }
    },
    '/audit/logs': {
      get: {
        summary: 'Consultar bitácora de auditoría inmutable',
        tags: ['Auditoría'],
        responses: { '200': { description: 'Registros de auditoría con diff de valores' } }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'MEMBER', 'VIEWER'] },
          preferredCurrency: { type: 'string', enum: ['USD', 'EUR', 'COP'] }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE', 'TRANSFER', 'CARD_PAYMENT', 'DEBT_PAYMENT', 'BALANCE_ADJUSTMENT'] },
          amount: { type: 'number' },
          currency: { type: 'string' },
          date: { type: 'string', format: 'date' },
          accountId: { type: 'string' },
          category: { type: 'string' },
          paymentMethod: { type: 'string' },
          description: { type: 'string' },
          visibility: { type: 'string', enum: ['PRIVATE', 'SHARED', 'FAMILY'] }
        }
      },
      NewTransactionRequest: {
        type: 'object',
        required: ['userId', 'type', 'amount', 'currency', 'date', 'accountId', 'category', 'paymentMethod'],
        properties: {
          userId: { type: 'string' },
          type: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          date: { type: 'string', format: 'date' },
          accountId: { type: 'string' },
          category: { type: 'string' },
          paymentMethod: { type: 'string' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          visibility: { type: 'string', enum: ['PRIVATE', 'SHARED', 'FAMILY'] }
        }
      },
      Account: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          currentBalance: { type: 'number' },
          currency: { type: 'string' },
          visibility: { type: 'string' }
        }
      },
      NewAccountRequest: {
        type: 'object',
        required: ['name', 'type', 'currency', 'initialBalance'],
        properties: {
          name: { type: 'string' },
          type: { type: 'string' },
          currency: { type: 'string' },
          initialBalance: { type: 'number' },
          institutionName: { type: 'string' }
        }
      },
      CreditCard: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          creditLimit: { type: 'number' },
          usedAmount: { type: 'number' },
          closingDay: { type: 'integer' },
          dueDay: { type: 'integer' }
        }
      },
      Debt: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          creditor: { type: 'string' },
          currentBalance: { type: 'number' },
          annualInterestRate: { type: 'number' },
          monthlyInstallment: { type: 'number' }
        }
      }
    }
  }
};
