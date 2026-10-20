# PDF Reader

Leitor e editor de PDF que roda 100% no navegador: o arquivo não é enviado para nenhum servidor. Funciona offline depois da primeira visita e pode ser instalado como app (PWA).

<!-- Adicione prints na pasta docs/ e descomente:
![Tela inicial](docs/tela-inicial.png)
![Editando um PDF](docs/edicao.png)
-->

## Recursos

**Leitura**
- Arrastar e soltar ou selecionar PDF (até 50MB), miniaturas, zoom, tela cheia
- Lembra a última página e o zoom de cada PDF
- Busca no PDF (Ctrl+F) sem diferenciar maiúsculas nem acentos
- Leitura em voz alta com a palavra falada destacada, escolha de voz e velocidade, e botões para pular frases
- Páginas escuras (inverte as cores para ler à noite) e tema claro/escuro
- Índice (marcadores) do PDF, quando existir

**Edição**
- Texto, desenho livre, marca-texto, retângulo, imagem, apagar e desfazer
- Assinatura desenhada (fica salva no navegador) e carimbos (data de hoje, APROVADO, CÓPIA, etc.)
- Tarja que oculta o conteúdo de verdade (a página vira imagem, então o texto coberto some do arquivo)
- Preencher formulários PDF (campos de texto, caixas de seleção e listas)
- Marca d'água, numeração de páginas, página em branco e corte de margens

**Organização**
- Reordenar páginas arrastando as miniaturas (ou pelos botões), girar e excluir
- Extrair/dividir por intervalo (ex.: 1-3, 5) e juntar vários PDFs
- Imagens para PDF e compressão de PDF
- OCR para PDF escaneado (tesseract.js): grava o texto de forma invisível, então busca, cópia e voz passam a funcionar

**Exportar**
- Baixar o PDF editado, imprimir, compartilhar, exportar o texto em `.txt` e uma página como imagem PNG

**Outros**
- Interface em português e inglês (Configurações → Idioma)
- Favoritos e histórico (salvos no navegador)
- Atalhos: setas trocam de página, `+` e `-` dão zoom, `0` zoom 100%, Ctrl+F busca, Ctrl+Z desfaz, Ctrl+S salva

## Estrutura
```
pdf-reader/
├── index.html            # estrutura da página
├── style.css             # visual (tema escuro/claro)
├── app.js                # lógica: leitura, edição, busca, voz, OCR, organização
├── i18n.js               # tradução português/inglês
├── sw.js                 # service worker (modo offline)
├── manifest.webmanifest  # app instalável (PWA)
├── icon-192.png / icon-512.png
├── vendor/               # bibliotecas locais (pdf.js, pdf-lib, tesseract.js e idiomas do OCR)
├── LICENSE
└── README.md
```

## Tecnologias
HTML, CSS e JavaScript puro, mais:
[pdf.js](https://mozilla.github.io/pdf.js/) (visualização), [pdf-lib](https://pdf-lib.js.org/) (edição) e [tesseract.js](https://tesseract.projectnaptha.com/) (OCR). Elas ficam na pasta `vendor/`, com as respectivas licenças em `vendor/licenses/`.



## Limitações
- Não edita o texto original do PDF: adiciona novas marcações por cima
- Páginas com tarja ou comprimidas perdem o texto selecionável e os links (viram imagem)
- Texto adicionado usa a fonte Helvetica (acentos do português funcionam; outros alfabetos viram "?")
- Reordenar e juntar podem descartar índice e campos de formulário
- O OCR depende da qualidade da imagem e é lento em PDFs grandes
- Login e sincronização entre aparelhos: indisponíveis no momento (favoritos e histórico ficam só no navegador)
- A fonte Inter é carregada do Google Fonts; sem internet o site usa a fonte padrão do sistema

## Licença
MIT, veja [LICENSE](LICENSE).
