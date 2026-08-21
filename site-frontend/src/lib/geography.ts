/**
 * Presença geográfica do Grupo Dimensão — São Paulo e Mato Grosso do Sul.
 *
 * Fonte: docs/PROJECT_BLUEPRINT.md §12 ("Abrangência"), reproduzida aqui
 * exatamente (mesma grafia/acentuação, mesma ordem) — nenhuma cidade foi
 * adicionada, removida ou corrigida. Ver docs/HOME_IMPLEMENTATION_READINESS.md
 * §6 para a checagem de precisão desta transcrição.
 *
 * Deliberadamente estático (não uma tabela de CMS) — ver
 * docs/HOME_IMPLEMENTATION_READINESS.md §5, que decidiu não criar um módulo
 * de CMS de cidades agora (47 linhas com lat/long seria complexidade
 * desproporcional ao que a seção "Presença Geográfica" precisa mostrar).
 * Não consumido por nenhum componente ainda — nenhuma seção visual foi
 * criada nesta etapa.
 */

export type GeographicState = {
  state: string;
  cities: readonly string[];
};

export const SAO_PAULO_CITIES: readonly string[] = [
  "Limeira",
  "Mogi das Cruzes",
  "Mogi Mirim",
  "Paulínia",
  "Poá",
  "Rio Claro",
  "São José dos Campos",
  "São Paulo",
  "Suzano",
  "Amparo",
  "Araras",
  "Campinas",
  "Cordeirópolis",
  "Cosmópolis",
  "Diadema",
  "Guararema",
  "Guarulhos",
  "Itatiba",
  "Jacareí",
];

export const MATO_GROSSO_DO_SUL_CITIES: readonly string[] = [
  "Água Clara",
  "Aquidauana",
  "Bandeirantes",
  "Bodoquena",
  "Bonito",
  "Camapuã",
  "Campo Grande",
  "Cassilândia",
  "Corguinho",
  "Corumbá",
  "Dois Irmãos do Buriti",
  "Dourados",
  "Guia Lopes da Laguna",
  "Jaraguari",
  "Jardim",
  "Maracaju",
  "Miranda",
  "Nioaque",
  "Nova Andradina",
  "Ponta Porã",
  "Porto Murtinho",
  "Ribas do Rio Pardo",
  "Rio Brilhante",
  "Rochedo",
  "Selvíria",
  "Sidrolândia",
  "Terenos",
  "Três Lagoas",
];

export const GEOGRAPHIC_PRESENCE: readonly GeographicState[] = [
  { state: "São Paulo", cities: SAO_PAULO_CITIES },
  { state: "Mato Grosso do Sul", cities: MATO_GROSSO_DO_SUL_CITIES },
];

export const TOTAL_CITIES_COUNT: number =
  SAO_PAULO_CITIES.length + MATO_GROSSO_DO_SUL_CITIES.length;
