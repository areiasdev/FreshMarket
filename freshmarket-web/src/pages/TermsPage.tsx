import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        <div className="mb-10">
          <Link to="/" className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
            ← Voltar ao início
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mb-2">
          Termos e Condições
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-10">
          Última atualização: março de 2026
        </p>

        <div className="space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              1. Identificação
            </h2>
            <p className="text-sm">
              A plataforma <strong>FreshMarket</strong> é operada em Portugal e destina-se à
              comercialização de produtos hortofrutícolas frescos diretamente ao consumidor final.
              Para contacto: {" "}
              <a href="mailto:geral@freshmarketprod.pt"
                className="text-emerald-600 dark:text-emerald-400 hover:underline">
                geral@freshmarketprod.pt
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              2. Objeto
            </h2>
            <p className="text-sm">
              Os presentes Termos e Condições regulam a utilização da plataforma FreshMarket e
              a compra e venda de produtos disponíveis no catálogo online. Ao criar uma conta
              ou efetuar uma encomenda, o utilizador aceita integralmente estes termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              3. Registo e Conta
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>O registo é gratuito e requer um endereço de e-mail válido.</li>
              <li>O utilizador é responsável pela confidencialidade das suas credenciais de acesso.</li>
              <li>
                Cada conta é pessoal e intransmissível. É proibido criar contas em nome de
                terceiros sem autorização.
              </li>
              <li>
                Reservamo-nos o direito de suspender ou encerrar contas em caso de uso abusivo
                ou violação destes termos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              4. Encomendas
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>
                A encomenda é confirmada após receção de pagamento (ou após validação no caso
                de pagamento a dinheiro na entrega).
              </li>
              <li>
                O utilizador receberá uma confirmação por e-mail e uma notificação na plataforma.
              </li>
              <li>
                A disponibilidade dos produtos está sujeita a stock. Em caso de rutura de stock
                após encomenda, o utilizador será contactado para substituição ou reembolso.
              </li>
              <li>
                As quantidades de produtos vendidos por peso (kg) podem ter uma variação de até
                ±10% em relação ao valor encomendado, sendo faturado o peso real entregue.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              5. Preços e Pagamento
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>Todos os preços indicados incluem IVA à taxa legal em vigor.</li>
              <li>
                Os preços podem ser alterados sem aviso prévio. O preço aplicável é o
                vigente no momento em que a encomenda é confirmada.
              </li>
              <li>
                São aceites os seguintes métodos de pagamento: <strong>Cartão de crédito/débito</strong>{" "}
                (via Stripe), <strong>MBWay</strong> (via ifthenpay) e{" "}
                <strong>Pagamento em dinheiro na entrega</strong>.
              </li>
              <li>
                Em caso de falha de pagamento, a encomenda não será processada. O utilizador
                pode tentar novamente com outro método.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              6. Entregas
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li>
                As entregas são realizadas nas zonas geográficas indicadas na plataforma.
                Fora dessas zonas, a encomenda poderá não ser aceite.
              </li>
              <li>
                O prazo de entrega é o indicado no slot de entrega selecionado pelo utilizador
                no momento do checkout. Na ausência de slot, o prazo estimado é de 72 horas úteis.
              </li>
              <li>
                O custo de entrega é calculado com base na velocidade escolhida e é apresentado
                antes da confirmação da encomenda.
              </li>
              <li>
                Em caso de ausência no momento da entrega, o estafeta tentará contacto por
                telemóvel. Se não for possível entregar, a encomenda será reagendada ou cancelada,
                conforme acordado.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              7. Direito de Arrependimento e Devoluções
            </h2>
            <p className="mb-3 text-sm">
              Nos termos do Decreto-Lei n.º 24/2014, o consumidor dispõe de um prazo de{" "}
              <strong>14 dias</strong> para exercer o direito de livre resolução do contrato,
              sem necessidade de indicar o motivo.
            </p>
            <p className="mb-3 text-sm font-semibold text-amber-700 dark:text-amber-400">
              Exceção importante: bens que se deterioram rapidamente
            </p>
            <p className="text-sm">
              Nos termos do Art.º 17.º n.º 1 b) do referido decreto-lei, o direito de
              arrependimento <strong>não se aplica</strong> a bens que, pela sua natureza, se
              deterioram rapidamente — o que inclui a maioria dos produtos hortofrutícolas frescos
              comercializados nesta plataforma.
            </p>
            <p className="mt-3 text-sm">
              Em caso de entrega de produto em mau estado, danificado ou diferente do encomendado,
              o utilizador deve contactar-nos em até <strong>24 horas</strong> após a receção,
              com foto do produto. Procederemos à substituição ou reembolso integral.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              8. Cancelamento de Encomendas
            </h2>
            <p className="text-sm">
              O utilizador pode cancelar a sua encomenda enquanto o estado for{" "}
              <strong>Pendente</strong>. Após o início da preparação, o cancelamento não é
              garantido. Para cancelamentos urgentes, contacte-nos diretamente por e-mail.
              Em caso de cancelamento após pagamento, o reembolso será processado no prazo
              de 5 a 10 dias úteis para o método de pagamento original.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              9. Responsabilidade
            </h2>
            <p className="text-sm">
              A FreshMarket não se responsabiliza por atrasos nas entregas causados por
              fatores externos fora do seu controlo (condições meteorológicas adversas, greves,
              situações de força maior). Em tais casos, o utilizador será notificado e a entrega
              reagendada sem custo adicional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              10. Propriedade Intelectual
            </h2>
            <p className="text-sm">
              Todo o conteúdo da plataforma (textos, imagens, logótipos, código) é propriedade
              da FreshMarket ou dos seus licenciantes, protegido por direitos de autor. É proibida
              a reprodução total ou parcial sem autorização expressa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              11. Alterações
            </h2>
            <p className="text-sm">
              Reservamo-nos o direito de alterar estes Termos e Condições em qualquer momento.
              As alterações entram em vigor na data da sua publicação. O uso continuado da
              plataforma após a publicação de alterações constitui aceitação das mesmas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              12. Lei Aplicável e Foro
            </h2>
            <p className="text-sm">
              Estes Termos são regidos pela lei portuguesa. Em caso de litígio, as partes
              comprometem-se a recorrer a meios de resolução alternativa de conflitos de consumo
              (RAL) antes de qualquer ação judicial. Para mais informações:{" "}
              <a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline">
                www.consumidor.gov.pt
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 flex gap-6 text-sm">
          <Link to="/privacidade" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            Política de Privacidade
          </Link>
          <Link to="/" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Voltar à loja
          </Link>
        </div>

      </div>
    </div>
  );
}
