# Guia completo de customização cyberpunk com HeroUI

A biblioteca HeroUI oferece capacidades excepcionais para criar interfaces com estética cyberpunk/hacker usando fundo preto sólido e verde neon, sem parecer um terminal. Baseado em TailwindCSS e React Aria, com animações via Framer Motion, o HeroUI permite customização profunda através de seu sistema de temas.

## Sistema de customização de temas do HeroUI

O HeroUI utiliza um sistema de tokens de design baseado no plugin `tw-colors` do TailwindCSS, permitindo controle total sobre cores, espaçamentos e elementos visuais. A customização acontece através do arquivo `tailwind.config.js`, onde você define temas personalizados com paletas de cores em gradações de 50-900.

Para a estética cyberpunk desejada, a configuração ideal combina **preto puro (#000000)** como background com **verde neon (#00ff00, #39ff14, #0fff50)** como cor primária. O sistema suporta múltiplas camadas de conteúdo (content1-4) para criar profundidade visual, essencial para interfaces tech modernas.

### Configuração completa do tema cyberpunk

```javascript
// tailwind.config.js
const { heroui } = require("@heroui/theme");

module.exports = {
  plugins: [
    heroui({
      defaultTheme: "cyberpunk-dark",
      themes: {
        "cyberpunk-dark": {
          extend: "dark",
          colors: {
            background: "#000000",
            foreground: "#00ff00",
            primary: {
              DEFAULT: "#00ff00",
              50: "#0fff50",
              500: "#00b300",
              900: "#004d00"
            },
            secondary: {
              DEFAULT: "#00ffff"
            },
            content1: "#0a0a0a",
            content2: "#141414",
            focus: "#00ff00"
          },
          layout: {
            radius: {
              small: "2px",
              medium: "4px",
              large: "6px"
            },
            borderWidth: {
              medium: "2px"
            }
          }
        }
      }
    })
  ]
}
```

## Mapeamento completo dos 50 componentes disponíveis

O HeroUI oferece uma biblioteca rica com **50 componentes**, dos quais **20+ são perfeitos para interfaces cyberpunk**. Os componentes mais relevantes para o visual tech incluem:

### Componentes prioritários para visual cyberpunk

**Cards com efeitos de blur** - O componente Card suporta `isBlurred` nativo, criando efeitos de glassmorphism perfeitos para overlays futurísticos. Combine com bordas neon usando `className="border-2 border-primary shadow-[0_0_15px_rgba(0,255,0,0.3)]"`.

**Buttons com múltiplas variantes** - Sete variantes disponíveis (solid, bordered, ghost, flat, faded, shadow, light), sendo `bordered` e `ghost` ideais para botões cyberpunk. Adicione glow effects com classes customizadas de shadow.

**Progress e CircularProgress** - Ambos suportam modo `isIndeterminate` com animações contínuas, perfeitos para HUDs. Use cores neon e combine com `isStriped` para efeitos visuais dinâmicos.

**Modal com backdrop blur** - Configuração `backdrop="blur"` cria overlays com desfoque, essencial para interfaces futurísticas. Suporta animações customizadas via `motionProps`.

**Input com visual tech** - Classes personalizáveis por slot permitem criar inputs com glow. Use `classNames={{inputWrapper: "border-primary/50 focus-within:shadow-[0_0_10px_rgba(0,255,0,0.3)]"}}`.

### Componentes de animação e feedback

O **Spinner** oferece cinco estilos diferentes de animação (default, gradient, wave, dots, bars), enquanto o **Skeleton** fornece estados de loading com shimmer effects. O **Switch** é perfeito para toggles cyberpunk com suporte a ícones customizados no thumb.

## Recursos específicos para visual cyberpunk

### Efeitos de glow e neon

O HeroUI integra completamente com TailwindCSS, permitindo uso de arbitrary values para criar efeitos de neon precisos:

```jsx
// Botão com glow neon verde
<Button 
  className="shadow-[0_0_5px_#00ff00,0_0_10px_#00ff00,0_0_15px_#00ff00]"
  variant="bordered"
>
  HACK THE SYSTEM
</Button>

// Card com borda gradient
<Card className="bg-black/90 border border-primary/50 backdrop-blur-sm">
  <CardBody>
    <Text className="text-primary text-shadow-[0_0_20px_currentColor]">
      Cyberpunk Interface
    </Text>
  </CardBody>
</Card>
```

### Animações e transições

Através do Framer Motion integrado, componentes suportam `motionProps` para animações customizadas. Combine com classes utilitárias do Tailwind como `animate-pulse`, `animate-spin` ou crie keyframes personalizados:

```css
@keyframes glow {
  from { box-shadow: 0 0 5px #00ff00; }
  to { box-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00; }
}

.animate-glow {
  animation: glow 2s ease-in-out infinite alternate;
}
```

### Tipografia tech

Configure fontes monoespaçadas através do sistema de layout:

```javascript
layout: {
  fontFamily: {
    sans: ["'Orbitron'", "system-ui"],
    mono: ["'Share Tech Mono'", "monospace"]
  }
}
```

## Implementação prática do tema cyberpunk

### Setup inicial

```bash
# Instalação via CLI (recomendado)
npx @heroui/cli@latest init meu-app-cyberpunk

# Adicionar componentes específicos
npx @heroui/cli@latest add button card input modal progress
```

### Provider de tema

```tsx
// app/providers.tsx
import { HeroUIProvider } from '@heroui/react'

export function Providers({ children }) {
  return (
    <HeroUIProvider>
      <div className="cyberpunk-dark min-h-screen bg-background text-foreground">
        {children}
      </div>
    </HeroUIProvider>
  )
}
```

### Exemplo completo de interface cyberpunk

```tsx
export default function CyberpunkInterface() {
  return (
    <div className="p-8 space-y-6">
      {/* Header com texto neon */}
      <h1 className="text-4xl font-bold text-primary text-shadow-[0_0_20px_currentColor]">
        NEURAL INTERFACE
      </h1>

      {/* Card principal com efeitos */}
      <Card 
        className="bg-content1 border-2 border-primary/30 shadow-[0_0_20px_rgba(0,255,0,0.2)]"
        isBlurred
      >
        <CardBody className="space-y-4">
          <Input
            placeholder="Enter command..."
            classNames={{
              inputWrapper: "bg-black border-primary/50 hover:border-primary focus-within:shadow-[0_0_10px_rgba(0,255,0,0.3)]"
            }}
          />
          
          <div className="flex gap-4">
            <Button color="primary" className="font-mono">
              EXECUTE
            </Button>
            <Button variant="bordered" className="border-primary text-primary">
              ABORT
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Indicadores de status */}
      <div className="flex gap-4">
        <Progress 
          color="primary" 
          isIndeterminate 
          className="max-w-md"
        />
        <Badge color="success" variant="dot">
          SYSTEM ONLINE
        </Badge>
      </div>
    </div>
  )
}
```

### CSS personalizado para efeitos avançados

```css
/* styles/globals.css */
@layer utilities {
  .text-glow {
    text-shadow: 0 0 10px currentColor;
  }
  
  .border-glow {
    box-shadow: inset 0 0 10px rgba(0, 255, 159, 0.5), 
                0 0 10px rgba(0, 255, 159, 0.3);
  }
  
  .cyberpunk-gradient {
    background: linear-gradient(135deg, #00ff9f 0%, #00ffff 100%);
  }
}
```

## Paleta de cores cyberpunk recomendada

Para alcançar o visual desejado sem parecer terminal, use estas combinações:

- **Primária**: #00ff00 (verde neon puro)
- **Variações**: #39ff14 (verde limão elétrico), #0fff50 (verde neon brilhante)
- **Secundária**: #00ffff (ciano neon)
- **Acentos**: #ff008d (rosa quente), #fcee0c (amarelo elétrico)
- **Backgrounds**: #000000 (preto puro), #0a0a0a (cinza muito escuro para cards)

## Recursos de implementação

O HeroUI oferece compatibilidade com React 18+, Next.js (app/pages router), Vite, Remix e Astro. A documentação completa está em heroui.com/docs, com Storybook disponível para visualização de componentes. Templates prontos podem ser criados via CLI, facilitando o início rápido com configurações otimizadas.

Para maximizar o desempenho, utilize tree-shaking importando apenas componentes necessários, leverage CSS variables para troca de temas, e implemente lazy loading para componentes pesados. A acessibilidade é mantida com suporte completo a ARIA labels, navegação por teclado e indicadores de foco aprimorados para fundos escuros.

Esta implementação completa do HeroUI permite criar interfaces cyberpunk sofisticadas com fundo preto sólido e verde neon, mantendo uma estética moderna e tech sem visual de terminal, através de componentes ricos em animações, efeitos de glow personalizáveis e sistema de temas profundamente configurável.