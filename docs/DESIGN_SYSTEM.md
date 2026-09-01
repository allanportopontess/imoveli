# DESIGN_SYSTEM.md — IMOVELI

> Fonte de verdade para UI. Toda implementação de interface deve seguir este documento.
> Mantenedor: ux-architect

## Princípios

1. **Confiança é o produto** — cada elemento transmite segurança e profissionalismo
2. **Mobile first** — pedreiro e engenheiro acessam pelo celular na obra
3. **Feedback imediato** — toda ação tem resposta visual em <300ms
4. **Linguagem do setor** — termos que o profissional já conhece

## Paleta de cores (variáveis CSS)

```css
/* Primária */
--violet: #7c3aed;           /* identidade, botões principais, destaques */
--violet-deep: #5b21b6;      /* hover de botão, gradiente escuro */
--violet-light: #ede9fe;     /* backgrounds de badge, chips leves */

/* Neutros */
--neutral-50: #f9fafb;
--neutral-100: #f3f4f6;
--neutral-200: #e5e7eb;
--neutral-300: #d1d5db;
--neutral-400: #9ca3af;
--neutral-500: #6b7280;
--neutral-600: #4b5563;
--neutral-700: #374151;
--neutral-800: #1f2937;
--neutral-900: #111827;

/* Semânticas */
--success: #10b981;          /* ação positiva, verificado, aceito */
--warning: #f59e0b;          /* atenção, pendente */
--error: #ef4444;            /* erro, recusado */
--info: #3b82f6;             /* informação neutra */
```

## Tipografia

```css
/* Display — títulos principais */
font-family: var(--font-display);  /* ex: Sora, sans-serif */
font-weight: 700;

/* Body — texto padrão */
font-size: 14px;
line-height: 1.6;
color: var(--neutral-700);

/* Label de campo */
font-size: 11px;
text-transform: uppercase;
letter-spacing: 0.08em;
opacity: 0.7;

/* Metadado / subtexto */
font-size: 12px;
color: var(--neutral-500);
```

## Componentes existentes

### `.card`
```css
background: white;
border-radius: 16px;
box-shadow: 0 1px 4px rgba(0,0,0,0.06);
padding: 16px;
```

### `.section`
```css
background: white;
border-radius: 14px;
border: 1px solid var(--neutral-200);
padding: 20px;
margin-bottom: 16px;
```

### `.btn.btn-primary`
```css
background: var(--violet);
color: white;
border: none;
border-radius: 10px;
padding: 10px 20px;
font-weight: 600;
cursor: pointer;
/* hover: background: var(--violet-deep) */
```

### `.btn.btn-secondary`
```css
background: transparent;
color: var(--neutral-700);
border: 1.5px solid var(--neutral-300);
border-radius: 10px;
padding: 10px 20px;
```

### `.form-group`
```html
<div class="form-group">
    <label>Nome do campo</label>
    <input type="text" placeholder="...">
    <!-- erro aparece aqui como .campo-erro -->
</div>
```

### Card do Perfil Profissional (roxo)
```css
background: linear-gradient(135deg, var(--violet) 0%, var(--violet-deep) 100%);
border-radius: 20px;
padding: 24px;
color: white;
```

## Estados obrigatórios

Todo componente de lista/dado deve implementar:

| Estado | HTML/texto |
|--------|-----------|
| Carregando | `<p style="color:var(--neutral-500);">Carregando…</p>` |
| Vazio | Ícone + texto motivacional + CTA |
| Erro de rede | `Erro ao conectar. Tente novamente.` + botão retry |
| Erro de campo | `.campo-erro` vermelho abaixo do input, sem `alert()` |
| Sucesso | Verde, some em 3s ou mensagem inline |

## Breakpoints

```css
/* Mobile first */
/* Default: 375px+ */

@media (min-width: 640px) { /* Tablet pequeno */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

## Terminologia oficial na interface

| ❌ Evitar | ✅ Usar |
|----------|--------|
| Fiador Técnico | Responsável Técnico |
| Carteirinha | Perfil Profissional IMOVELI |
| Prestador | Profissional |
| Cadastrar prestador | Indicar profissional |
| Senha incorreta | E-mail ou senha incorretos |
| Erro desconhecido | Algo deu errado. Tente novamente. |
| null / undefined | (omitir o campo) |
| Loading... | Carregando… |

## Ícones (emoji nativos — sem biblioteca)

| Uso | Emoji |
|-----|-------|
| Verificado | ✓ ou ✅ |
| Pendente | ⏳ |
| Responsável Técnico | 🛡️ |
| Localização | 📍 |
| Profissional | 👤 |
| Rede de profissionais | 👥 |
| Chat / IA | 💬 |
| Foto | 📷 |
| Estrela / avaliação | ★ |
| Configurações | ⚙️ |
