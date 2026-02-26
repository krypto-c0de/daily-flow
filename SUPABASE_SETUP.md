# 🔐 Configurando o Login com Supabase

## 1. Criar conta no Supabase (grátis)
Acesse https://supabase.com e crie uma conta gratuita.

## 2. Criar um novo projeto
- Clique em "New project"
- Escolha um nome (ex: dailyflow)
- Defina uma senha para o banco
- Selecione a região mais próxima (ex: São Paulo)

## 3. Pegar as credenciais
Após criar o projeto, vá em:
**Settings → API**

Copie:
- **Project URL** (ex: https://abcxyz.supabase.co)
- **anon public** key

## 4. Criar arquivo .env
Na raiz do projeto, crie um arquivo `.env`:

```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

## 5. Configurar provedores de Auth (opcional)
Para habilitar o **Login com Google**:
- Supabase → Authentication → Providers → Google
- Siga as instruções para criar credenciais OAuth no Google Cloud Console

## 6. Rodar o projeto
```bash
npm install
npm run dev
```

## ℹ️ Modo offline
O app funciona sem login! Na tela de login, clique em **"Usar sem login"**.
Os dados ficam salvos localmente no dispositivo.

## 🔄 Futuro: Sync na nuvem
Para sincronizar dados entre dispositivos, você precisará criar as tabelas
`goals` e `tasks` no Supabase e integrar o store com as operações do banco.
