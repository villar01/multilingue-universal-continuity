/**
 * country-compliance.ts
 * Conformidade moral e legal por país para os 69 idiomas.
 * Tolerância ZERO: pedofilia, abuso infantil, discriminação, conteúdo imoral.
 * A IA de segurança usa este módulo para detectar, bloquear e alertar o admin.
 */

export type ViolationType =
  | 'PEDOPHILIA'           // Tolerância ZERO — crime universal
  | 'CHILD_ABUSE'          // Tolerância ZERO — crime universal
  | 'SEXUAL_EXPLICIT'      // Conteúdo sexual explícito
  | 'DISCRIMINATION_RACE'  // Discriminação racial
  | 'DISCRIMINATION_GENDER'// Discriminação de gênero
  | 'DISCRIMINATION_RELIGION' // Discriminação religiosa
  | 'DISCRIMINATION_DISABILITY' // Discriminação por deficiência
  | 'DISCRIMINATION_SEXUAL_ORIENTATION' // Discriminação por orientação sexual
  | 'HATE_SPEECH'          // Discurso de ódio
  | 'VIOLENCE'             // Conteúdo violento
  | 'TERRORISM'            // Terrorismo / extremismo
  | 'DRUG_PROMOTION'       // Promoção de drogas ilegais
  | 'GAMBLING_ILLEGAL'     // Jogo ilegal (onde proibido)
  | 'POLITICAL_CENSORED'   // Conteúdo politicamente censurado (China, Irã, etc.)
  | 'RELIGIOUS_OFFENSE'    // Ofensa religiosa grave (Países islâmicos, etc.)
  | 'PAYWALL_BYPASS'       // Tentativa de burlar pagamento
  | 'SCRAPING'             // Extração automatizada de conteúdo
  | 'BOT_ABUSE'            // Uso de bots
  | 'RATE_LIMIT'           // Excesso de requisições
  | 'SQL_INJECTION'        // Ataque SQL
  | 'XSS'                  // Cross-site scripting
  | 'UNAUTHORIZED_ACCESS'; // Acesso não autorizado

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ComplianceRule {
  type: ViolationType;
  severity: Severity;
  description: string;
  /** Lei ou norma violada */
  legalReference: string;
  /** Ação imediata a tomar */
  immediateAction: 'BAN_USER' | 'BLOCK_REQUEST' | 'RATE_LIMIT' | 'WARN_USER' | 'NOTIFY_ADMIN';
  /** Dicas para o admin */
  adminTips: string[];
  /** Deve reportar às autoridades? */
  reportToAuthorities: boolean;
}

export interface CountryCompliance {
  countryCode: string;
  countryName: string;
  languageCodes: string[];
  /** Regras específicas deste país (além das universais) */
  specificRules: Partial<Record<ViolationType, Partial<ComplianceRule>>>;
  /** Conteúdo proibido específico */
  prohibitedContent: string[];
  /** Notas culturais importantes */
  culturalNotes: string[];
}

// ============================================================
// REGRAS UNIVERSAIS — Tolerância ZERO em TODOS os países
// ============================================================
export const UNIVERSAL_RULES: Record<string, ComplianceRule> = {
  PEDOPHILIA: {
    type: 'PEDOPHILIA',
    severity: 'CRITICAL',
    description: 'Conteúdo sexual envolvendo menores de idade',
    legalReference: 'Lei 8.069/90 ECA (Brasil) — Art. 241; Convenção da ONU sobre os Direitos da Criança (1989) — Art. 34; Diretiva 2011/93/EU (Europa)',
    immediateAction: 'BAN_USER',
    adminTips: [
      '🚨 AÇÃO IMEDIATA: Banir usuário permanentemente e preservar todos os logs',
      '📋 Registrar IP, user-agent, timestamps e conteúdo como evidência',
      '🚔 Reportar ao Ministério Público (Brasil: Disque 100) ou autoridade local',
      '🔒 Bloquear IP e todos os dispositivos associados à conta',
      '📧 Notificar equipe jurídica imediatamente',
      '💾 NÃO apagar evidências — preservar para investigação criminal',
    ],
    reportToAuthorities: true,
  },
  CHILD_ABUSE: {
    type: 'CHILD_ABUSE',
    severity: 'CRITICAL',
    description: 'Abuso, exploração ou negligência infantil',
    legalReference: 'Lei 8.069/90 ECA (Brasil) — Art. 5°; Convenção de Lanzarote (Europa); Convenção da ONU sobre os Direitos da Criança',
    immediateAction: 'BAN_USER',
    adminTips: [
      '🚨 AÇÃO IMEDIATA: Banir e preservar evidências',
      '🚔 Reportar ao Conselho Tutelar (Brasil) ou autoridade equivalente',
      '📋 Documentar tudo antes de qualquer remoção de conteúdo',
      '💰 RISCO DE MONETIZAÇÃO: Plataformas com esse conteúdo perdem contratos de publicidade e pagamento',
    ],
    reportToAuthorities: true,
  },
  HATE_SPEECH: {
    type: 'HATE_SPEECH',
    severity: 'HIGH',
    description: 'Discurso de ódio contra qualquer grupo',
    legalReference: 'Lei 7.716/89 (Brasil — Crimes de Preconceito); Art. 20 PIDCP (ONU); Código Penal Alemão § 130',
    immediateAction: 'BAN_USER',
    adminTips: [
      '⚠️ Banir usuário e remover conteúdo',
      '📋 Registrar para análise de padrões recorrentes',
      '💰 RISCO: Anunciantes abandonam plataformas com discurso de ódio — impacto direto na receita',
      '🔍 Verificar se há rede coordenada de usuários com comportamento similar',
    ],
    reportToAuthorities: false,
  },
  DISCRIMINATION_RACE: {
    type: 'DISCRIMINATION_RACE',
    severity: 'HIGH',
    description: 'Discriminação racial',
    legalReference: 'Lei 7.716/89 (Brasil); Civil Rights Act 1964 (EUA); Diretiva 2000/43/CE (Europa)',
    immediateAction: 'BAN_USER',
    adminTips: [
      '⚠️ Banir usuário imediatamente',
      '📋 Documentar incidente para relatório de conformidade',
      '💰 RISCO: Violações de anti-discriminação geram multas e processos',
    ],
    reportToAuthorities: false,
  },
  DISCRIMINATION_GENDER: {
    type: 'DISCRIMINATION_GENDER',
    severity: 'HIGH',
    description: 'Discriminação de gênero',
    legalReference: 'Lei 9.029/95 (Brasil); Title IX (EUA); Convenção CEDAW (ONU)',
    immediateAction: 'BAN_USER',
    adminTips: [
      '⚠️ Banir usuário e remover conteúdo',
      '📋 Registrar para relatório de conformidade de gênero',
    ],
    reportToAuthorities: false,
  },
  DISCRIMINATION_RELIGION: {
    type: 'DISCRIMINATION_RELIGION',
    severity: 'HIGH',
    description: 'Discriminação religiosa',
    legalReference: 'CF/88 Art. 5° VIII (Brasil); First Amendment (EUA); Art. 9° CEDH (Europa)',
    immediateAction: 'BAN_USER',
    adminTips: [
      '⚠️ Banir usuário',
      '🌍 Atenção especial em países islâmicos — blasfêmia pode ser crime grave',
    ],
    reportToAuthorities: false,
  },
  DISCRIMINATION_DISABILITY: {
    type: 'DISCRIMINATION_DISABILITY',
    severity: 'HIGH',
    description: 'Discriminação por deficiência',
    legalReference: 'Lei 13.146/15 (Brasil — Lei Brasileira de Inclusão); ADA (EUA); Convenção ONU sobre Direitos das Pessoas com Deficiência',
    immediateAction: 'BAN_USER',
    adminTips: ['⚠️ Banir usuário', '📋 Registrar incidente'],
    reportToAuthorities: false,
  },
  DISCRIMINATION_SEXUAL_ORIENTATION: {
    type: 'DISCRIMINATION_SEXUAL_ORIENTATION',
    severity: 'HIGH',
    description: 'Discriminação por orientação sexual ou identidade de gênero',
    legalReference: 'STF ADO 26/2019 (Brasil — criminaliza LGBTfobia); Yogyakarta Principles (ONU)',
    immediateAction: 'BAN_USER',
    adminTips: ['⚠️ Banir usuário', '📋 Registrar para conformidade'],
    reportToAuthorities: false,
  },
  SEXUAL_EXPLICIT: {
    type: 'SEXUAL_EXPLICIT',
    severity: 'HIGH',
    description: 'Conteúdo sexual explícito em plataforma educacional',
    legalReference: 'Lei 8.069/90 ECA (Brasil) — Art. 241; LGPD (Lei 13.709/18) — Art. 14; Marco Civil da Internet (Lei 12.965/14) — Art. 7',
    immediateAction: 'BAN_USER',
    adminTips: [
      '⚠️ Remover conteúdo e banir usuário',
      '💰 RISCO CRÍTICO: Plataformas educacionais com conteúdo adulto perdem certificações e parcerias',
      '👨‍👩‍👧 Especialmente grave se usuário for menor — acionar protocolo PEDOPHILIA',
    ],
    reportToAuthorities: false,
  },
  TERRORISM: {
    type: 'TERRORISM',
    severity: 'CRITICAL',
    description: 'Promoção ou apologia ao terrorismo',
    legalReference: 'Lei 13.260/16 (Brasil — Antiterrorismo); 18 U.S.C. § 2339B (EUA); Diretiva 2017/541/EU',
    immediateAction: 'BAN_USER',
    adminTips: [
      '🚨 AÇÃO IMEDIATA: Banir e reportar às autoridades',
      '🚔 Contatar Polícia Federal (Brasil) ou FBI/Interpol conforme país',
      '💾 Preservar TODAS as evidências',
    ],
    reportToAuthorities: true,
  },
  PAYWALL_BYPASS: {
    type: 'PAYWALL_BYPASS',
    severity: 'HIGH',
    description: 'Tentativa de acessar conteúdo premium sem pagamento',
    legalReference: 'Lei 9.609/98 (Brasil — Lei do Software); DMCA (EUA); Diretiva 2001/29/CE (Europa)',
    immediateAction: 'BLOCK_REQUEST',
    adminTips: [
      '💰 IMPACTO DIRETO NA RECEITA: Revisar e reforçar proteção de endpoints',
      '🔒 Implementar rate limiting mais agressivo para este IP',
      '📊 Analisar padrão de acesso — pode ser ataque coordenado',
      '🛡️ Considerar adicionar CAPTCHA ou autenticação adicional',
      '📋 Registrar IP para monitoramento contínuo',
    ],
    reportToAuthorities: false,
  },
  SCRAPING: {
    type: 'SCRAPING',
    severity: 'MEDIUM',
    description: 'Extração automatizada de conteúdo protegido',
    legalReference: 'Lei 9.609/98 (Brasil); CFAA (EUA); Diretiva 96/9/CE (Europa — bases de dados)',
    immediateAction: 'BLOCK_REQUEST',
    adminTips: [
      '💰 RISCO: Conteúdo roubado pode aparecer em concorrentes',
      '🔒 Implementar rate limiting e honeypots',
      '🤖 Adicionar robots.txt e verificação de User-Agent',
      '📊 Monitorar padrões de acesso anômalos',
    ],
    reportToAuthorities: false,
  },
  SQL_INJECTION: {
    type: 'SQL_INJECTION',
    severity: 'CRITICAL',
    description: 'Tentativa de injeção SQL',
    legalReference: 'Lei 12.737/12 (Brasil — Lei Carolina Dieckmann); CFAA (EUA); NIS2 Directive (Europa)',
    immediateAction: 'BAN_USER',
    adminTips: [
      '🚨 ATAQUE ATIVO: Bloquear IP imediatamente',
      '🔍 Verificar se houve acesso não autorizado a dados',
      '💾 Revisar logs de banco de dados das últimas 24h',
      '🔒 Verificar integridade dos dados de usuários e pagamentos',
      '📧 Notificar equipe técnica para auditoria de segurança',
      '💰 RISCO CRÍTICO: Vazamento de dados de pagamento gera multas LGPD/GDPR',
    ],
    reportToAuthorities: true,
  },
  XSS: {
    type: 'XSS',
    severity: 'HIGH',
    description: 'Tentativa de Cross-Site Scripting',
    legalReference: 'Lei 12.737/12 (Brasil); CFAA (EUA)',
    immediateAction: 'BLOCK_REQUEST',
    adminTips: [
      '🔒 Bloquear IP e revisar sanitização de inputs',
      '🔍 Verificar se outros usuários foram afetados',
      '📋 Registrar para análise de padrões de ataque',
    ],
    reportToAuthorities: false,
  },
};

// ============================================================
// REGRAS ESPECÍFICAS POR PAÍS
// ============================================================
export const COUNTRY_COMPLIANCE: CountryCompliance[] = [
  {
    countryCode: 'BR',
    countryName: 'Brasil',
    languageCodes: ['pt-BR'],
    specificRules: {
      GAMBLING_ILLEGAL: {
        severity: 'HIGH',
        legalReference: 'Lei 13.756/18 (apostas esportivas); Decreto-Lei 3.688/41 (contravenções)',
        adminTips: ['⚠️ Jogos de azar são regulamentados — verificar licença', '💰 Multas pesadas por operação ilegal'],
      },
      DRUG_PROMOTION: {
        severity: 'HIGH',
        legalReference: 'Lei 11.343/06 (Lei de Drogas) Art. 33',
        adminTips: ['🚨 Crime inafiançável — reportar à Polícia Civil'],
      },
    },
    prohibitedContent: [
      'Promoção de jogos de azar sem licença',
      'Apologia ao crime (Art. 287 CP)',
      'Conteúdo que viole o ECA',
      'Desinformação eleitoral (Lei 9.504/97)',
    ],
    culturalNotes: [
      'Diversidade religiosa — respeitar todas as religiões',
      'Sensibilidade racial — país com histórico de escravidão',
      'LGBTQIA+ protegido por lei desde 2019',
    ],
  },
  {
    countryCode: 'US',
    countryName: 'Estados Unidos',
    languageCodes: ['en-US'],
    specificRules: {
      PAYWALL_BYPASS: {
        severity: 'CRITICAL',
        legalReference: 'DMCA 17 U.S.C. § 1201; CFAA 18 U.S.C. § 1030',
        adminTips: [
          '💰 DMCA permite processar por danos de até $150.000 por violação',
          '🔒 Documentar todas as tentativas para processo legal',
        ],
      },
    },
    prohibitedContent: [
      'CSAM (Child Sexual Abuse Material) — crime federal',
      'Ameaças ao Presidente (18 U.S.C. § 871)',
      'Violação de copyright sem fair use',
    ],
    culturalNotes: [
      'Liberdade de expressão ampla — mas com limites claros',
      'COPPA: crianças menores de 13 anos têm proteção especial',
      'Diversidade étnica e racial — sensibilidade necessária',
    ],
  },
  {
    countryCode: 'GB',
    countryName: 'Reino Unido',
    languageCodes: ['en-GB'],
    specificRules: {
      HATE_SPEECH: {
        severity: 'CRITICAL',
        legalReference: 'Public Order Act 1986; Racial and Religious Hatred Act 2006; Online Safety Act 2023',
        adminTips: [
          '🚨 Online Safety Act 2023 — multas de até £18 milhões ou 10% da receita global',
          '🔒 Obrigação legal de remover conteúdo ilegal rapidamente',
        ],
      },
    },
    prohibitedContent: [
      'Incitação ao ódio racial ou religioso',
      'Conteúdo que glorifique terrorismo',
      'Imagens de abuso infantil',
    ],
    culturalNotes: [
      'Leis de difamação mais rígidas que nos EUA',
      'Proteção de dados GDPR (pós-Brexit: UK GDPR)',
    ],
  },
  {
    countryCode: 'DE',
    countryName: 'Alemanha',
    languageCodes: ['de-DE', 'de-AT'],
    specificRules: {
      HATE_SPEECH: {
        severity: 'CRITICAL',
        legalReference: 'StGB § 130 (Volksverhetzung); NetzDG (Network Enforcement Act)',
        adminTips: [
          '🚨 NetzDG: conteúdo ilegal deve ser removido em 24h (casos óbvios) ou 7 dias',
          '💰 Multas de até €50 milhões por descumprimento',
          '🚫 Símbolos nazistas são proibidos — § 86a StGB',
        ],
      },
      POLITICAL_CENSORED: {
        severity: 'HIGH',
        legalReference: 'GG Art. 18 (perda de direitos fundamentais por abuso)',
        adminTips: ['⚠️ Conteúdo que negue o Holocausto é crime — § 130 StGB'],
      },
    },
    prohibitedContent: [
      'Símbolos nazistas e neonazistas',
      'Negação do Holocausto',
      'Incitação ao ódio (Volksverhetzung)',
    ],
    culturalNotes: [
      'Proteção de dados GDPR — mais rigorosa que a média europeia',
      'Sensibilidade extrema a conteúdo de extrema-direita',
    ],
  },
  {
    countryCode: 'CN',
    countryName: 'China',
    languageCodes: ['zh-CN', 'cmn-CN'],
    specificRules: {
      POLITICAL_CENSORED: {
        severity: 'CRITICAL',
        legalReference: 'Lei de Segurança da Internet da China (2017); Lei de Segurança Nacional (2015)',
        adminTips: [
          '🚨 Conteúdo sobre Taiwan, Tibet, Xinjiang, Tiananmen é bloqueado',
          '🔒 VPNs não autorizadas são ilegais',
          '💰 Operação na China requer licença ICP e conformidade com censura',
          '⚠️ Críticas ao governo/Partido Comunista são proibidas',
        ],
      },
    },
    prohibitedContent: [
      'Críticas ao Partido Comunista Chinês',
      'Conteúdo sobre independência de Taiwan',
      'Referências ao massacre de Tiananmen',
      'Conteúdo sobre Falun Gong',
      'VPNs e ferramentas de contorno de censura',
    ],
    culturalNotes: [
      'Grande Firewall — muitos serviços ocidentais bloqueados',
      'Sensibilidade extrema a questões de soberania territorial',
    ],
  },
  {
    countryCode: 'SA',
    countryName: 'Arábia Saudita',
    languageCodes: ['ar-XA', 'ar-EG'],
    specificRules: {
      RELIGIOUS_OFFENSE: {
        severity: 'CRITICAL',
        legalReference: 'Lei Anti-Blasfêmia da Arábia Saudita; Código Penal Islâmico',
        adminTips: [
          '🚨 Blasfêmia contra o Islã pode resultar em pena de morte',
          '🔒 Conteúdo que critique o Islã deve ser bloqueado para usuários desta região',
          '💰 Operação na região requer conformidade com lei islâmica',
        ],
      },
      DISCRIMINATION_SEXUAL_ORIENTATION: {
        severity: 'CRITICAL',
        legalReference: 'Código Penal Saudita — homossexualidade é crime',
        adminTips: [
          '⚠️ Conteúdo LGBTQ+ é ilegal na Arábia Saudita',
          '🔒 Filtrar conteúdo por geolocalização para esta região',
        ],
      },
    },
    prohibitedContent: [
      'Críticas ao Islã ou ao Profeta Maomé',
      'Conteúdo LGBTQ+',
      'Conteúdo alcoólico ou de jogos de azar',
      'Críticas à família real',
    ],
    culturalNotes: [
      'País islâmico — lei da Sharia aplicada',
      'Segregação de gênero em espaços públicos',
      'Ramadã — sensibilidade especial durante o período',
    ],
  },
  {
    countryCode: 'IR',
    countryName: 'Irã',
    languageCodes: ['fa-IR'],
    specificRules: {
      POLITICAL_CENSORED: {
        severity: 'CRITICAL',
        legalReference: 'Lei de Crimes Informáticos do Irã (2009)',
        adminTips: [
          '🚨 Críticas ao governo iraniano ou ao Líder Supremo são crimes',
          '🔒 Muitos serviços ocidentais são bloqueados no Irã',
        ],
      },
      RELIGIOUS_OFFENSE: {
        severity: 'CRITICAL',
        legalReference: 'Art. 513 Código Penal Islâmico do Irã',
        adminTips: ['🚨 Blasfêmia pode resultar em pena de morte no Irã'],
      },
    },
    prohibitedContent: [
      'Críticas ao governo islâmico',
      'Conteúdo pró-Israel',
      'Conteúdo LGBTQ+',
      'Blasfêmia contra o Islã',
    ],
    culturalNotes: [
      'República Islâmica — lei religiosa integrada ao estado',
      'Censura extensiva de internet',
    ],
  },
  {
    countryCode: 'RU',
    countryName: 'Rússia',
    languageCodes: ['ru-RU'],
    specificRules: {
      POLITICAL_CENSORED: {
        severity: 'HIGH',
        legalReference: 'Lei de Soberania da Internet (2019); Lei de Fake News (2019)',
        adminTips: [
          '⚠️ Críticas à guerra na Ucrânia são criminalizadas (Lei 20.3.3)',
          '🔒 Conteúdo que "desacredite" as forças armadas russas é proibido',
          '💰 Multas e bloqueio de plataformas por não conformidade',
        ],
      },
      DISCRIMINATION_SEXUAL_ORIENTATION: {
        severity: 'HIGH',
        legalReference: 'Lei de Propaganda Gay (2013, expandida 2023)',
        adminTips: [
          '⚠️ Conteúdo LGBTQ+ para menores é proibido',
          '🔒 Filtrar conteúdo LGBTQ+ para usuários russos',
        ],
      },
    },
    prohibitedContent: [
      'Críticas à operação militar na Ucrânia',
      'Conteúdo LGBTQ+ para menores',
      'Símbolos de organizações "extremistas" (inclui alguns grupos ocidentais)',
    ],
    culturalNotes: [
      'Censura crescente desde 2022',
      'Sensibilidade a questões de soberania e patriotismo',
    ],
  },
  {
    countryCode: 'JP',
    countryName: 'Japão',
    languageCodes: ['ja-JP'],
    specificRules: {},
    prohibitedContent: [
      'Conteúdo que glorifique crimes de guerra (Lei de Paz Pública)',
      'Imagens obscenas (Art. 175 Código Penal)',
    ],
    culturalNotes: [
      'Cultura de respeito e hierarquia — evitar conteúdo desrespeitoso',
      'Sensibilidade a questões históricas da Segunda Guerra Mundial',
      'Privacidade muito valorizada',
    ],
  },
  {
    countryCode: 'IN',
    countryName: 'Índia',
    languageCodes: ['hi-IN', 'bn-IN', 'ur-IN'],
    specificRules: {
      RELIGIOUS_OFFENSE: {
        severity: 'CRITICAL',
        legalReference: 'IPC Seção 295A (ofensa religiosa deliberada)',
        adminTips: [
          '🚨 Ofensas religiosas podem causar violência em massa na Índia',
          '⚠️ Sensibilidade extrema entre hindus, muçulmanos, sikhs e cristãos',
        ],
      },
    },
    prohibitedContent: [
      'Conteúdo que ofenda sentimentos religiosos',
      'Conteúdo que promova separatismo (Caxemira, etc.)',
      'Pornografia (proibida por lei)',
    ],
    culturalNotes: [
      'País com maior diversidade religiosa do mundo',
      'Sensibilidade a castas — evitar conteúdo que reforce discriminação',
      'IT Act 2000 — regulamenta conteúdo digital',
    ],
  },
];

// ============================================================
// MOTOR DE DETECÇÃO E RESPOSTA
// ============================================================

export interface SecurityAlert {
  id: string;
  timestamp: Date;
  violationType: ViolationType;
  severity: Severity;
  userId?: number;
  ipAddress?: string;
  endpoint?: string;
  description: string;
  evidence?: Record<string, unknown>;
  adminTips: string[];
  legalReference: string;
  actionTaken: string;
  requiresImmediateAction: boolean;
  monetizationRisk: boolean;
}

/**
 * Prioridade Legal Brasileira
 * A plataforma opera primariamente sob jurisdição brasileira. Leis brasileiras
 * (LGPD, ECA, Marco Civil, Lei Rouanet) têm prioridade sobre referências internacionais.
 * Referências a leis americanas (18 U.S.C., COPPA, DMCA) são mantidas apenas como
 * informação complementar, nunca como base legal principal.
 */
export const BRAZILIAN_LAW_PRIORITY = {
  primaryJurisdiction: 'Brasil',
  primaryLaws: [
    { code: 'LGPD', full: 'Lei 13.709/18', description: 'Lei Geral de Proteção de Dados' },
    { code: 'ECA', full: 'Lei 8.069/90', description: 'Estatuto da Criança e do Adolescente' },
    { code: 'MARCO_CIVIL', full: 'Lei 12.965/14', description: 'Marco Civil da Internet' },
    { code: 'LEI_ROUANET', full: 'Lei 8.313/91', description: 'Lei de Incentivo à Cultura' },
    { code: 'CODIGO_CIVIL', full: 'Lei 10.406/02', description: 'Código Civil Brasileiro' },
    { code: 'CODIGO_PENAL', full: 'Decreto-Lei 2.848/40', description: 'Código Penal' },
  ],
  // Leis internacionais usadas apenas como referência complementar
  secondaryLaws: [
    { code: 'GDPR', jurisdiction: 'Europa', description: 'Regulamento 2016/679' },
    { code: 'COPPA', jurisdiction: 'EUA', description: 'Children\'s Online Privacy Protection Act' },
    { code: 'CONVENCAO_ONU', jurisdiction: 'Internacional', description: 'Convenção sobre Direitos da Criança' },
  ],
  note: 'Em caso de conflito entre leis brasileiras e internacionais, prevalece a legislação brasileira. As referências a leis americanas e europeias são meramente informativas.',
} as const;

/** Detecta padrões de bypass de paywall */
export function detectPaywallBypass(requestCount: number, timeWindowMs: number, isPremiumEndpoint: boolean, isAuthenticated: boolean): boolean {
  if (isPremiumEndpoint && !isAuthenticated) return true;
  if (requestCount > 100 && timeWindowMs < 60000) return true; // 100 req/min
  return false;
}

/** Detecta padrões de scraping */
export function detectScraping(requestCount: number, timeWindowMs: number, userAgent: string): boolean {
  const botAgents = ['bot', 'crawler', 'spider', 'scraper', 'wget', 'curl', 'python-requests', 'java/', 'go-http'];
  const isBotAgent = botAgents.some(b => userAgent.toLowerCase().includes(b));
  if (isBotAgent) return true;
  if (requestCount > 200 && timeWindowMs < 60000) return true; // 200 req/min
  return false;
}

/** Detecta injeção SQL */
export function detectSQLInjection(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|;|\/\*|\*\/|xp_|sp_)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /('\s*(OR|AND)\s*'?\d)/i,
    /(SLEEP\s*\(|BENCHMARK\s*\(|WAITFOR\s+DELAY)/i,
  ];
  return patterns.some(p => p.test(input));
}

/** Detecta XSS */
export function detectXSS(input: string): boolean {
  const patterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /window\.location/i,
  ];
  return patterns.some(p => p.test(input));
}

/** Detecta conteúdo com violação moral */
export function detectMoralViolation(content: string): { detected: boolean; type?: ViolationType; severity?: Severity } {
  const contentLower = content.toLowerCase();

  // Tolerância ZERO — Pedofilia
  const pedoKeywords = ['child porn', 'cp ', 'loli', 'shota', 'underage sex', 'menor sexo', 'criança nua', 'pedo'];
  if (pedoKeywords.some(k => contentLower.includes(k))) {
    return { detected: true, type: 'PEDOPHILIA', severity: 'CRITICAL' };
  }

  // Abuso infantil
  const abuseKeywords = ['child abuse', 'abuso infantil', 'criança abusada', 'molestar criança'];
  if (abuseKeywords.some(k => contentLower.includes(k))) {
    return { detected: true, type: 'CHILD_ABUSE', severity: 'CRITICAL' };
  }

  // Discurso de ódio
  const hateKeywords = ['kill all', 'morte a', 'exterminar', 'raça inferior', 'inferior race', 'genocide'];
  if (hateKeywords.some(k => contentLower.includes(k))) {
    return { detected: true, type: 'HATE_SPEECH', severity: 'HIGH' };
  }

  // Terrorismo
  const terrorKeywords = ['allahu akbar kill', 'jihad attack', 'bomb school', 'bomba escola', 'ataque terrorista'];
  if (terrorKeywords.some(k => contentLower.includes(k))) {
    return { detected: true, type: 'TERRORISM', severity: 'CRITICAL' };
  }

  return { detected: false };
}

/** Gera alerta de segurança formatado */
export function createSecurityAlert(
  violationType: ViolationType,
  context: {
    userId?: number;
    ipAddress?: string;
    endpoint?: string;
    description: string;
    evidence?: Record<string, unknown>;
  }
): SecurityAlert {
  const rule = UNIVERSAL_RULES[violationType];
  const isCritical = rule?.severity === 'CRITICAL';

  return {
    id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    violationType,
    severity: rule?.severity || 'MEDIUM',
    userId: context.userId,
    ipAddress: context.ipAddress,
    endpoint: context.endpoint,
    description: context.description,
    evidence: context.evidence,
    adminTips: rule?.adminTips || ['Revisar e tomar ação apropriada'],
    legalReference: rule?.legalReference || 'Verificar legislação aplicável',
    actionTaken: rule?.immediateAction || 'NOTIFY_ADMIN',
    requiresImmediateAction: isCritical,
    monetizationRisk: ['PAYWALL_BYPASS', 'SCRAPING', 'SQL_INJECTION', 'PEDOPHILIA', 'HATE_SPEECH'].includes(violationType),
  };
}

/** Retorna regras de conformidade para um idioma/país, com proteção universal como fallback. */
export function getComplianceForLanguage(languageCode: string): CountryCompliance {
  const normalizedCode = languageCode.toLowerCase();
  const specificRuleSet = COUNTRY_COMPLIANCE.find((country) =>
    country.languageCodes.some((code) => code.toLowerCase() === normalizedCode),
  );

  if (specificRuleSet) return specificRuleSet;

  return {
    countryCode: 'UNIVERSAL',
    countryName: 'Proteção universal',
    languageCodes: [languageCode],
    specificRules: {},
    prohibitedContent: [],
    culturalNotes: ['Regras universais de proteção infantil, segurança e respeito são aplicadas a este idioma.'],
  };
}

/** Verifica se conteúdo é permitido em um país específico */
export function isContentAllowedInCountry(content: string, languageCode: string): { allowed: boolean; reason?: string; rule?: ComplianceRule } {
  const universalViolation = detectMoralViolation(content);
  if (universalViolation.detected && universalViolation.type) {
    const rule = UNIVERSAL_RULES[universalViolation.type];
    return {
      allowed: false,
      reason: rule?.description || 'Violação das regras universais de segurança',
      rule,
    };
  }

  const compliance = getComplianceForLanguage(languageCode);

  for (const prohibited of compliance.prohibitedContent) {
    if (content.toLowerCase().includes(prohibited.toLowerCase())) {
      return {
        allowed: false,
        reason: `Conteúdo proibido em ${compliance.countryName}: ${prohibited}`,
      };
    }
  }

  return { allowed: true };
}

export default {
  UNIVERSAL_RULES,
  COUNTRY_COMPLIANCE,
  detectPaywallBypass,
  detectScraping,
  detectSQLInjection,
  detectXSS,
  detectMoralViolation,
  createSecurityAlert,
  getComplianceForLanguage,
  isContentAllowedInCountry,
};
