# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/4cd92afe-41ed-47c3-a44a-0363e31acdd1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/4cd92afe-41ed-47c3-a44a-0363e31acdd1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🚀 Demo EverInbox

### Quick Start
1. `npm install && npm run dev`
2. Explore Sidebar ► Audiências, Ferramentas, Relatórios
3. Tudo roda com dados mock ― zero backend necessário

### Features Implementadas
**Audiências:**
- Segmentos (VIP 30d, MA-2C, SE-90) com auto/manual
- Tags automáticas e Smart-Tag Builder
- Listas com origem Facebook/manual
- Overlap Checker entre segmentos

**Ferramentas:**
- Planner com drag-and-drop e receita estimada
- Warm-up Wizard (3 etapas: IP, Cronograma, Resumo)
- Automação Canvas com react-flow (3 nós)
- Limpeza de listas com candidatos para remoção
- Backfill automático
- Biblioteca de Macros e Receitas

**Análises:**
- Heat Map 24×7 com eRPM colorido
- Guardrails (spam/bounce rates)
- Best Time Widget por segmento
- RFM Matrix com métricas
- Frequency Cap Controls

### Navegação
- **Audiências** → `/audiencias/segmentos`, `/audiencias/tags`, `/audiencias/listas`
- **Planner** → `/planner-new` (drag-and-drop funcional)
- **Heat Map** → `/reports` (grid 24×7 interativo)
- **Warm-up** → `/warmup` (wizard 3 passos)
- **Automação** → `/automation` (canvas react-flow)

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/4cd92afe-41ed-47c3-a44a-0363e31acdd1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
