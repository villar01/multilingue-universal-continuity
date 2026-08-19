const realSteps = [
  {
    number: "1",
    title: "Gere uma cópia nova",
    instruction:
      "Na página Backup e restauração, localize “Exportar dados das tarefas” e clique em “Exportar”. Aguarde a mensagem verde “Exportação concluída”.",
    image: "/manus-storage/01-exportar_b474ab64.png",
    alt: "Página oficial de Backup e restauração com a exportação de dados das tarefas.",
  },
  {
    number: "2",
    title: "Clique em Baixar",
    instruction:
      "No cartão que mostra “Exportação concluída”, clique somente no botão azul “Baixar”. Não clique novamente em “Exportar”.",
    image: "/manus-storage/02-baixar_3e073807.png",
    alt: "Página oficial mostrando o pacote concluído e o botão azul Baixar.",
  },
  {
    number: "3",
    title: "Espere o aplicativo local concluir",
    instruction:
      "O Manus Data Restoration recebe o pacote e faz a cópia para o notebook. Espere aparecer o estado verde “Baixado”.",
    image: "/manus-storage/03-verificar_3071c62d.png",
    alt: "Aplicativo Manus Data Restoration mostrando o pacote de tarefas baixado no notebook.",
  },
  {
    number: "4",
    title: "Verifique os pacotes",
    instruction:
      "Clique em “Verificar pacotes de dados”. Só considere a cópia concluída quando todos os pacotes passarem na verificação.",
    image: "/manus-storage/03-verificar_3071c62d.png",
    alt: "Aplicativo Manus Data Restoration com o botão Verificar pacotes de dados.",
  },
];

export default function BackupGuide() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Guia real de backup</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Backup no notebook: quatro ações diretas
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">
            Use estas telas reais para fazer uma cópia mais recente. O processo cria uma cópia; ele não restaura, não apaga e não altera o aplicativo.
          </p>
          <a
            href="https://manus.im/backup"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Abrir a página oficial de backup
          </a>
        </header>

        <section className="mt-7 space-y-7" aria-label="Passo a passo com páginas reais">
          {realSteps.map((step) => (
            <article key={step.number} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-blue-50 p-5 sm:flex sm:items-start sm:gap-5 sm:p-7">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xl font-black text-white">
                  {step.number}
                </span>
                <div className="mt-3 sm:mt-0">
                  <h2 className="text-2xl font-black text-slate-950">{step.title}</h2>
                  <p className="mt-2 text-base font-medium leading-relaxed text-slate-800">{step.instruction}</p>
                </div>
              </div>
              <img src={step.image} alt={step.alt} className="block w-full bg-white" />
            </article>
          ))}
        </section>

        <aside className="mt-7 rounded-3xl border-2 border-red-300 bg-red-50 p-6 sm:p-8" aria-label="Atenção">
          <p className="text-2xl font-black text-red-800">Não clique em “Importar dados locais”. Não restaure nada.</p>
          <p className="mt-3 text-base leading-relaxed text-red-950">
            “Importar dados locais” é para uma restauração futura. Neste guia, faça somente: Exportar, Baixar, aguardar o aplicativo e Verificar pacotes.
          </p>
        </aside>

        <p className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 text-base leading-relaxed text-slate-700">
          Para uma proteção oficial completa, repita o mesmo processo na seção separada “Exportar dados da conta”. Guarde a nova cópia junto da anterior, sem renomear ou alterar os arquivos internos.
        </p>
      </div>
    </main>
  );
}
