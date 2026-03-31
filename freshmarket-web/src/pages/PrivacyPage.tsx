import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        <div className="mb-10">
          <Link to="/" className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
            ← Voltar ao início
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-50 mb-2">
          Política de Privacidade
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-10">
          Última atualização: março de 2026
        </p>

        <div className="space-y-10 text-stone-700 dark:text-stone-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              1. Responsável pelo Tratamento
            </h2>
            <p>
              O responsável pelo tratamento dos seus dados pessoais é a <strong>FreshMarket</strong>,
              com sede em Portugal. Para qualquer questão relacionada com a privacidade dos seus
              dados, pode contactar-nos através do endereço{" "}
              <a href="mailto:geral@freshmarketprod.pt"
                className="text-emerald-600 dark:text-emerald-400 hover:underline">
                geral@freshmarketprod.pt
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              2. Dados Recolhidos
            </h2>
            <p className="mb-3">Recolhemos os seguintes dados pessoais:</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li><strong>Dados de identificação:</strong> nome e endereço de e-mail</li>
              <li><strong>Dados de contacto:</strong> número de telemóvel</li>
              <li><strong>Morada de entrega:</strong> rua, cidade, código postal e país</li>
              <li><strong>Dados de encomenda:</strong> produtos adquiridos, datas, valores e estado do pagamento</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de browser e sistema operativo (registos do servidor)</li>
            </ul>
            <p className="mt-3 text-sm">
              Não recolhemos dados de pagamento diretamente — os dados de cartão são tratados
              exclusivamente pela <strong>Stripe</strong> (certificada PCI DSS) e os dados MBWay
              pela <strong>ifthenpay</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              3. Finalidade e Base Legal
            </h2>
            <div className="space-y-4 text-sm">
              <div className="bg-stone-100 dark:bg-stone-900 rounded-lg p-4">
                <p className="font-semibold mb-1">Processamento de encomendas</p>
                <p className="text-stone-500 dark:text-stone-400">
                  Base legal: execução do contrato (Art.º 6.º n.º 1 b) RGPD)
                </p>
              </div>
              <div className="bg-stone-100 dark:bg-stone-900 rounded-lg p-4">
                <p className="font-semibold mb-1">Envio de notificações transacionais por e-mail</p>
                <p className="text-stone-500 dark:text-stone-400">
                  Base legal: execução do contrato (Art.º 6.º n.º 1 b) RGPD)
                </p>
              </div>
              <div className="bg-stone-100 dark:bg-stone-900 rounded-lg p-4">
                <p className="font-semibold mb-1">Obrigações legais e fiscais</p>
                <p className="text-stone-500 dark:text-stone-400">
                  Base legal: obrigação legal (Art.º 6.º n.º 1 c) RGPD)
                </p>
              </div>
              <div className="bg-stone-100 dark:bg-stone-900 rounded-lg p-4">
                <p className="font-semibold mb-1">Melhoria do serviço e segurança</p>
                <p className="text-stone-500 dark:text-stone-400">
                  Base legal: interesse legítimo (Art.º 6.º n.º 1 f) RGPD)
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              4. Partilha de Dados
            </h2>
            <p className="mb-3 text-sm">
              Os seus dados podem ser partilhados com os seguintes subcontratantes, exclusivamente
              para prestar o serviço:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li><strong>Stripe Inc.</strong> — processamento de pagamentos por cartão</li>
              <li><strong>ifthenpay</strong> — processamento de pagamentos MBWay</li>
              <li><strong>Prestador de alojamento</strong> — infraestrutura de servidores</li>
              <li><strong>Prestador de e-mail transacional</strong> — envio de confirmações de encomenda</li>
            </ul>
            <p className="mt-3 text-sm">
              Não vendemos, alugamos nem partilhamos os seus dados com terceiros para fins
              comerciais ou de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              5. Conservação dos Dados
            </h2>
            <p className="text-sm">
              Os seus dados são conservados pelo período estritamente necessário às finalidades
              para as quais foram recolhidos, e no mínimo pelo prazo legalmente obrigatório
              (10 anos para documentos de natureza fiscal, nos termos do Código Comercial).
              Após esse período, os dados são anonimizados ou eliminados de forma segura.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              6. Os Seus Direitos (RGPD)
            </h2>
            <p className="mb-3 text-sm">Ao abrigo do Regulamento Geral de Proteção de Dados, tem direito a:</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm">
              <li><strong>Acesso</strong> — obter uma cópia dos seus dados pessoais</li>
              <li><strong>Retificação</strong> — corrigir dados inexatos ou incompletos</li>
              <li><strong>Apagamento</strong> — solicitar a eliminação dos seus dados ("direito ao esquecimento")</li>
              <li><strong>Portabilidade</strong> — receber os seus dados num formato estruturado</li>
              <li><strong>Oposição</strong> — opor-se ao tratamento baseado em interesse legítimo</li>
              <li><strong>Limitação</strong> — restringir o tratamento em determinadas circunstâncias</li>
            </ul>
            <p className="mt-3 text-sm">
              Para exercer qualquer um destes direitos, contacte-nos em{" "}
              <a href="mailto:geral@freshmarketprod.pt"
                className="text-emerald-600 dark:text-emerald-400 hover:underline">
                geral@freshmarketprod.pt
              </a>. Responderemos no prazo máximo de 30 dias.
              Tem ainda o direito de apresentar reclamação à{" "}
              <strong>CNPD</strong> (Comissão Nacional de Proteção de Dados) em{" "}
              <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline">
                www.cnpd.pt
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              7. Cookies
            </h2>
            <p className="text-sm">
              Este sítio web utiliza <strong>localStorage</strong> (tecnologia similar a cookies)
              exclusivamente para fins funcionais: manter a sessão de utilizador, guardar o carrinho
              de compras e a preferência de tema (claro/escuro). Não utilizamos cookies de
              rastreamento, publicidade ou analytics de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              8. Segurança
            </h2>
            <p className="text-sm">
              Adotamos medidas técnicas e organizativas adequadas para proteger os seus dados
              contra acesso não autorizado, perda acidental ou destruição, incluindo comunicações
              cifradas via HTTPS, autenticação por token e controlo de acesso por perfil de
              utilizador.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-3">
              9. Alterações a Esta Política
            </h2>
            <p className="text-sm">
              Reservamo-nos o direito de atualizar esta Política de Privacidade. Em caso de
              alterações significativas, notificaremos os utilizadores registados por e-mail.
              A data de última atualização está sempre indicada no topo desta página.
            </p>
          </section>

        </div>

        <div className="mt-14 pt-8 border-t border-stone-200 dark:border-stone-800 flex gap-6 text-sm">
          <Link to="/termos" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            Termos e Condições
          </Link>
          <Link to="/" className="text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
            Voltar à loja
          </Link>
        </div>

      </div>
    </div>
  );
}
