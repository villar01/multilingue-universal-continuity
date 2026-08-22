export type AvailabilityState = "operational" | "degraded" | "outage";

export type AvailabilityAssessment = {
  state: AvailabilityState;
  startedAt: number;
  affectedCapabilities: readonly ("immersive_scene" | "lesson" | "audio" | "account" | "payment")[];
};

export type AvailabilityGuidance = {
  customerMessage: string;
  recommendedRecovery: readonly string[];
  impactRecord: {
    scope: AvailabilityAssessment["affectedCapabilities"];
    startedAt: number;
    requiresOwnerReview: true;
  };
  compensation: {
    status: "not_applicable" | "owner_review_required";
    automaticFinancialAction: false;
  };
};

const CUSTOMER_MESSAGES: Record<AvailabilityState, string> = {
  operational: "Os recursos de aprendizado estão disponíveis. Se algo parecer diferente, o suporte privado está pronto para ajudar.",
  degraded: "Alguns recursos estão recebendo cuidado preventivo. Seus estudos e seu progresso permanecem protegidos; opções alternativas ficam disponíveis quando necessário.",
  outage: "Este recurso está recebendo atenção prioritária. Seu progresso permanece protegido e opções de continuidade serão apresentadas assim que estiverem disponíveis.",
};

/**
 * Produz orientação administrativa sem expor detalhes técnicos ao aluno e sem
 * conceder créditos, descontos, reembolsos ou qualquer condição comercial automaticamente.
 */
export function deriveAvailabilityGuidance(assessment: AvailabilityAssessment): AvailabilityGuidance {
  if (assessment.state === "operational") {
    return {
      customerMessage: CUSTOMER_MESSAGES.operational,
      recommendedRecovery: ["Manter a observação preventiva e o suporte privado disponíveis."],
      impactRecord: {
        scope: assessment.affectedCapabilities,
        startedAt: assessment.startedAt,
        requiresOwnerReview: true,
      },
      compensation: { status: "not_applicable", automaticFinancialAction: false },
    };
  }

  const recommendedRecovery = assessment.state === "degraded"
    ? [
      "Manter rotas alternativas de aprendizagem disponíveis.",
      "Confirmar a recuperação antes de encerrar o registro de impacto.",
    ]
    : [
      "Preservar o progresso e oferecer rotas alternativas quando existirem.",
      "Registrar o impacto agregado e confirmar a recuperação antes de encerrar o incidente.",
      "Submeter qualquer análise de compensação à revisão manual do proprietário conforme os termos vigentes.",
    ];

  return {
    customerMessage: CUSTOMER_MESSAGES[assessment.state],
    recommendedRecovery,
    impactRecord: {
      scope: assessment.affectedCapabilities,
      startedAt: assessment.startedAt,
      requiresOwnerReview: true,
    },
    compensation: { status: "owner_review_required", automaticFinancialAction: false },
  };
}
