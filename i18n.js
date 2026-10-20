/* Idioma da interface: português (padrão) e inglês.
   Escolha em Configurações → Idioma. A tradução é aplicada na tela e nos avisos. */
(function () {
  var L = "pt";
  try { L = JSON.parse(localStorage.getItem("pr:lang") || '"pt"') || "pt"; } catch (e) {}
  window.PR_LANG = L;

  var D = {
    "Início":"Home","Meu Histórico":"My History","Favoritos":"Favorites","Configurações":"Settings","Sobre":"About",
    "Alternar tema":"Toggle theme",
    "Organize seus documentos com praticidade!":"Organize your documents with ease!",
    "Seu PDF, sempre acessível.":"Your PDF, always within reach.",
    "Seu leitor de PDF online":"Your online PDF reader","rápido, seguro":"fast, secure","e completo!":"and complete!",
    "Abra, visualize e gerencie seus arquivos PDF de forma simples e eficiente.":"Open, view and manage your PDF files simply and efficiently.",
    "Arraste e solte seu arquivo aqui":"Drag and drop your file here","ou":"or","Selecionar Arquivo":"Select File",
    "Arquivos PDF (máx. 50MB)":"PDF files (max. 50MB)",
    "Anterior":"Previous","Próxima":"Next","Página":"Page","Diminuir":"Zoom out","Aumentar":"Zoom in","Baixar":"Download",
    "Imprimir":"Print","Favoritar":"Favorite","Tela cheia":"Full screen",
    "Buscar no PDF (Ctrl+F)":"Search in PDF (Ctrl+F)","Buscar":"Search","Buscar no PDF":"Search in PDF","Fechar busca":"Close search",
    "Selecionar e mover":"Select and move","Texto":"Text","Desenhar":"Draw","Marca-texto":"Highlighter","Retângulo":"Rectangle",
    "Tarja: oculta o conteúdo de verdade":"Redact: truly removes the content","Tarja que remove o conteúdo":"Redaction that removes content",
    "Inserir imagem ou assinatura":"Insert image or signature","Inserir imagem":"Insert image","Assinatura":"Signature",
    "Carimbos":"Stamps","Carimbo…":"Stamp…","Data de hoje":"Today's date","Apagar elemento":"Delete element",
    "Cor":"Color","Tamanho":"Size","Pequeno":"Small","Médio":"Medium","Grande":"Large","Desfazer":"Undo",
    "Girar página":"Rotate page","Excluir página":"Delete page",
    "Mover página para cima (antes)":"Move page up (earlier)","Mover página para cima":"Move page up",
    "Mover página para baixo (depois)":"Move page down (later)","Mover página para baixo":"Move page down",
    "Extrair ou dividir: salvar só algumas páginas":"Extract or split: save only some pages","Extrair páginas":"Extract pages",
    "Reconhecer texto (OCR) em PDF escaneado":"Recognize text (OCR) in scanned PDFs","Reconhecer texto (OCR)":"Recognize text (OCR)",
    "Juntar outros PDFs a este":"Merge other PDFs into this one","Juntar PDFs":"Merge PDFs",
    "Mais ferramentas":"More tools","Salvar PDF editado":"Save edited PDF",
    "Marca d'água…":"Watermark…","Numerar páginas…":"Number pages…","Inserir página em branco":"Insert blank page",
    "Cortar margens…":"Crop margins…","Preencher formulário…":"Fill in form…","Índice do PDF":"PDF outline",
    "Imagens para PDF…":"Images to PDF…","Comprimir PDF…":"Compress PDF…","Exportar texto (.txt)":"Export text (.txt)",
    "Exportar página como imagem":"Export page as image","Páginas escuras (ligar/desligar)":"Dark pages (on/off)",
    "Ferramentas":"Tools","Baixar PDF":"Download PDF","Adicionar aos Favoritos":"Add to Favorites","Remover dos Favoritos":"Remove from Favorites",
    "Compartilhar":"Share","Ouvir em voz alta":"Read aloud","Pausar leitura":"Pause reading",
    "Frase anterior":"Previous sentence","Próxima frase":"Next sentence",
    "Informações do Arquivo":"File Information","Nome:":"Name:","Tamanho:":"Size:","Páginas:":"Pages:",
    "Bem-vindo ao nosso Leitor de PDF!":"Welcome to our PDF Reader!",
    "Aqui você pode visualizar seus arquivos PDF de forma rápida, fácil e segura.":"Here you can view your PDF files quickly, easily and securely.",
    "Principais recursos:":"Main features:","Visualização rápida e responsiva":"Fast and responsive viewing",
    "Download e impressão do documento":"Document download and printing","Navegação simples entre as páginas":"Simple navigation between pages",
    "Interface moderna e intuitiva":"Modern and intuitive interface",
    "Cancelar":"Cancel","Fechar":"Close","Limpar":"Clear","Inserir no PDF":"Insert into PDF","Aplicar":"Apply",
    "Desenhe com o dedo ou o mouse. Ela fica salva neste navegador para você usar de novo.":"Draw with your finger or mouse. It stays saved in this browser so you can use it again.",
    "Preencher formulário":"Fill in form","Achatar (travar os campos depois de preencher)":"Flatten (lock the fields after filling)","Índice":"Outline",
    "Nenhum arquivo aberto ainda.":"No files opened yet.",
    "Nenhum favorito ainda. Abra um PDF e toque na estrela.":"No favorites yet. Open a PDF and tap the star.",
    "Remover":"Remove",
    "Salvo apenas neste navegador. Sincronizar entre aparelhos: indisponível no momento.":"Saved only in this browser. Syncing across devices: unavailable at the moment.",
    "Idioma":"Language","Voz":"Voice","Velocidade":"Speed","Idioma OCR":"OCR language","Português":"Portuguese","Inglês":"English","Português + Inglês":"Portuguese + English",
    'Voz e velocidade valem para o botão "Ouvir em voz alta". O tema se troca no botão sol/lua do topo.':'Voice and speed apply to the "Read aloud" button. Switch the theme with the sun/moon button at the top.',
    "Conta e sincronização":"Account and sync","Login":"Login","Entrar":"Sign in","Sincronizar":"Sync","Ativar":"Enable",
    "Indisponível no momento":"Unavailable at the moment","Entrar: indisponível no momento":"Sign in: unavailable at the moment",
    "Conta (indisponível no momento)":"Account (unavailable at the moment)",
    "PDF Reader abre, edita e organiza seus PDFs direto no navegador, sem enviar nada para servidor. Tem miniaturas, zoom, busca, edição, OCR, leitura em voz alta, favoritos e histórico.":"PDF Reader opens, edits and organizes your PDFs right in the browser, without sending anything to a server. It has thumbnails, zoom, search, editing, OCR, read aloud, favorites and history.",
    "Atalhos: setas trocam de página, + e - dão zoom, Ctrl+F busca, Ctrl+Z desfaz e Ctrl+S salva.":"Shortcuts: arrow keys change page, + and - zoom, Ctrl+F searches, Ctrl+Z undoes and Ctrl+S saves.",
    /* avisos */
    "Abra um PDF primeiro.":"Open a PDF first.","Aguarde o OCR terminar ou cancele.":"Wait for the OCR to finish or cancel it.",
    "Escolha um arquivo PDF.":"Choose a PDF file.","O arquivo passa de 50MB.":"The file is larger than 50MB.",
    "Não foi possível carregar o leitor. Verifique a internet.":"Could not load the reader. Check your connection.",
    "Abrindo…":"Opening…","Não consegui abrir esse PDF.":"Could not open this PDF.","Adicionado aos favoritos.":"Added to favorites.",
    "Seu navegador não permite compartilhar arquivos. Use Baixar PDF.":"Your browser cannot share files. Use Download PDF.",
    "Gerando PDF…":"Generating PDF…","Erro ao gerar o PDF.":"Error generating the PDF.",
    "Pronto. As páginas com tarja viraram imagem: o conteúdo coberto foi removido.":"Done. Pages with redactions became images: the covered content was removed.",
    "Erro ao preparar a impressão.":"Error preparing to print.",
    "Seu navegador não suporta leitura em voz alta.":"Your browser does not support reading aloud.",
    "Esta página não tem texto para ler (PDF escaneado?).":"This page has no text to read (scanned PDF?).",
    "Nada para desfazer.":"Nothing to undo.","O PDF precisa ter ao menos uma página.":"The PDF must have at least one page.",
    "Aplicando…":"Applying…","Reordenando…":"Reordering…","Não consegui reordenar as páginas.":"Could not reorder the pages.",
    "Não consegui aplicar a alteração.":"Could not apply the change.",
    "Intervalo inválido. Use algo como 1-3, 5.":"Invalid range. Use something like 1-3, 5.",
    "Cada PDF pode ter no máximo 50MB.":"Each PDF can be at most 50MB.","Juntando…":"Merging…",
    "Não consegui juntar. Algum PDF pode estar protegido ou corrompido.":"Could not merge. A PDF may be protected or corrupted.",
    "Não foi possível carregar as bibliotecas. Verifique a internet.":"Could not load the libraries. Check your connection.",
    "Não consegui extrair as páginas.":"Could not extract the pages.",
    "Não foi possível carregar o OCR. Verifique a internet.":"Could not load the OCR. Check your connection.",
    "Procurando páginas sem texto…":"Looking for pages without text…",
    "Todas as páginas já têm texto. Nada para reconhecer.":"All pages already have text. Nothing to recognize.",
    "Preparando o OCR…":"Preparing the OCR…","Preparando":"Preparing","Cancelando…":"Cancelling…",
    "O OCR falhou. Verifique a internet e tente de novo.":"The OCR failed. Check your connection and try again.",
    "OCR cancelado.":"OCR cancelled.","Não encontrei texto nas páginas.":"No text found on the pages.",
    "Aplicando o texto ao PDF…":"Adding the text to the PDF…","Não consegui aplicar o texto ao PDF.":"Could not add the text to the PDF.",
    "Login e sincronização: indisponível no momento.":"Login and sync: unavailable at the moment.",
    "Desenhe a assinatura primeiro.":"Draw the signature first.","Valor inválido.":"Invalid value.",
    "Este PDF não tem campos que dê para preencher.":"This PDF has no fillable fields.",
    "Não consegui ler os campos deste PDF.":"Could not read this PDF's fields.",
    "Este PDF não tem índice (marcadores).":"This PDF has no outline (bookmarks).",
    "Convertendo imagens…":"Converting images…","Não consegui converter as imagens.":"Could not convert the images.",
    "Escolha 1, 2 ou 3.":"Choose 1, 2 or 3.","Não consegui comprimir o PDF.":"Could not compress the PDF.",
    "Extraindo texto…":"Extracting text…","Não há texto neste PDF. Tente o OCR primeiro.":"There is no text in this PDF. Try the OCR first.",
    "Texto exportado.":"Text exported.","Gerando imagem…":"Generating image…",
    "Páginas escuras ligadas.":"Dark pages on.","Páginas escuras desligadas.":"Dark pages off.",
    "Marca d'água aplicada em todas as páginas.":"Watermark applied to all pages.","Páginas numeradas.":"Pages numbered.",
    "Página em branco inserida depois da atual.":"Blank page inserted after the current one.",
    "Margens cortadas.":"Margins cropped.","Formulário preenchido.":"Form filled in.",
    "Texto da marca d'água:":"Watermark text:",
    "Formato da numeração ({n} = página, {t} = total):":"Numbering format ({n} = page, {t} = total):","Página {n} de {t}":"Page {n} of {t}",
    "Quantos milímetros cortar de cada margem? (ex.: 10)":"How many millimeters to crop from each margin? (e.g. 10)",
    "Aplicar em todas as páginas?\nOK = todas · Cancelar = só a página atual":"Apply to all pages?\nOK = all · Cancel = current page only",
    "Qualidade da compressão: 1 = menor arquivo, 2 = equilibrada, 3 = melhor qualidade":"Compression quality: 1 = smallest file, 2 = balanced, 3 = best quality",
    "Comprimir deixa cada página como imagem: o texto deixa de ser selecionável (o OCR pode refazer). Será gerado um arquivo novo, e o que está aberto não muda. Continuar?":"Compressing turns each page into an image: the text stops being selectable (the OCR can redo it). A new file will be created and the open one will not change. Continue?",
    "Quais páginas salvar em um novo PDF? Ex.: 1-3, 5, 8-10":"Which pages to save as a new PDF? E.g. 1-3, 5, 8-10"
  };
  var R = [
    [/^Continuando da página (\d+)\.$/, "Resuming from page $1."],
    [/^Baixado um PDF com (\d+) página\(s\)\.$/, "Downloaded a PDF with $1 page(s)."],
    [/^(\d+) PDF\(s\) adicionados ao final\.$/, "$1 PDF(s) added at the end."],
    [/^Texto reconhecido em (\d+) página\(s\)\. Agora dá para buscar, copiar e ouvir\.$/, "Text recognized on $1 page(s). You can now search, copy and listen."],
    [/^Excluir a página (\d+)\?$/, "Delete page $1?"],
    [/^(\d+) página\(s\) sem texto serão reconhecidas\.\n[\s\S]*$/, "$1 page(s) without text will be recognized.\nThis may take a few minutes, and the language is downloaded the first time. Continue?"],
    [/^Página (\d+) de (\d+)( \d+%)?$/, "Page $1 of $2$3"],
    [/^Preparando o idioma…( \d+%)?$/, "Preparing the language…$1"],
    [/^Comprimindo página (\d+) de (\d+)…$/, "Compressing page $1 of $2…"],
    [/^Original (.+) → comprimido (.+)\.$/, "Original $1 → compressed $2."],
    [/^O arquivo não ficou menor \((.+)\)\. Tente a opção 1\.$/, "The file did not get smaller ($1). Try option 1."],
    [/^(\d+) imagem\(ns\) adicionada\(s\) como página\(s\) no final\.$/, "$1 image(s) added as page(s) at the end."],
    [/^Imagem da página (\d+) baixada \(sem as edições ainda não salvas\)\.$/, "Image of page $1 downloaded (without unsaved edits)."],
    [/^(.+) · (\d+) páginas · (.+)$/, "$1 · $2 pages · $3"]
  ];

  function tr(s) {
    if (typeof s !== "string") return s;
    var t = s.trim();
    if (!t) return s;
    var o = Object.prototype.hasOwnProperty.call(D, t) ? D[t] : undefined;
    if (o === undefined) {
      for (var i = 0; i < R.length; i++) if (R[i][0].test(t)) { o = t.replace(R[i][0], R[i][1]); break; }
    }
    if (o === undefined) return s;
    return s.replace(t, function () { return o; });
  }
  window.PRT = L === "en" ? tr : function (s) { return s; };
  if (L !== "en") return;

  document.documentElement.lang = "en";
  document.title = "PDF Reader — online PDF reader";
  var oc = window.confirm.bind(window), op = window.prompt.bind(window);
  window.confirm = function (m) { return oc(tr(String(m))); };
  window.prompt = function (m, d) { return op(tr(String(m)), d == null ? d : tr(String(d))); };

  var ATTR = ["title", "aria-label", "placeholder"];
  function attrs(el) {
    ATTR.forEach(function (a) {
      if (el.hasAttribute && el.hasAttribute(a)) {
        var v = el.getAttribute(a), r = tr(v);
        if (r !== v) el.setAttribute(a, r);
      }
    });
  }
  function walk(n) {
    if (n.nodeType === 3) { var v = n.nodeValue, r = tr(v); if (r !== v) n.nodeValue = r; return; }
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(n.tagName)) return;
    attrs(n);
    for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  walk(document.body);
  new MutationObserver(function (ms) {
    ms.forEach(function (m) {
      if (m.type === "characterData") walk(m.target);
      else if (m.type === "attributes") attrs(m.target);
      else m.addedNodes.forEach(walk);
    });
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
})();
