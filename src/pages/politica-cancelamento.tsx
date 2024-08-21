import LogoTicketKing from '@/icons/LogoTicketKing';
import styles from '../styles/cancelamento.module.scss';

export default function cancelamento() {
    return (
        <>
            <div className={styles.container}>
                <header>
                    <LogoTicketKing />
                </header>

                <div className={styles.bodyContent}>
                    <h1>Política de Cancelamento</h1>
                    <p>
                        Para cancelar seu ingresso no Ticket King, é importante
                        observar a política de cancelamento específica
                        estabelecida pela empresa para o evento em questão. Cada
                        evento pode ter regras distintas, e é crucial estar
                        ciente das condições antes de prosseguir com o
                        cancelamento. Abaixo, apresento um guia geral para o
                        processo de cancelamento no Ticket King: 1.Faça login na
                        sua conta no Ticket King usando o e-mail utilizado para
                        a compra. Certifique-se de que está utilizando o e-mail
                        do titular da compra, pois somente o titular tem
                        permissão para cancelar o pedido. No momento, o processo
                        de cancelamento está disponível apenas na página da web
                        e não no aplicativo. 2.Selecione o ingresso que deseja
                        cancelar, levando em consideração a política de
                        cancelamento e reembolso específica do evento. 3.Clique
                        no botão &quot;Cancelar Pedido&quot;. Esse botão estará
                        disponível somente se o pedido estiver dentro dos
                        parâmetros da política de cancelamento. 4.Revise as
                        condições de cancelamento e confirme que deseja
                        prosseguir com o cancelamento e reembolso do pedido
                        selecionado. ATENÇÃO O processo de cancelamento é
                        irreversível. Após a confirmação do cancelamento e
                        reembolso, não será possível aprovar novamente a compra.
                        Não é possível cancelar apenas um ingresso de um pedido.
                        Se optar pelo cancelamento, todos os ingressos
                        associados a esse pedido serão cancelados. Após seguir o
                        processo acima, aguarde o processamento do cancelamento
                        e observe os prazos de reembolso, dependendo do método
                        de pagamento utilizado. IMPORTANTE Se a plataforma não
                        permitir a conclusão do reembolso, é possível que o seu
                        pedido não atenda às condições de reembolso, conforme a
                        Política de Cancelamento da Ticket King. Para
                        compreender essas condições. Esperamos que estas
                        instruções tenham sido úteis! Em caso de dúvidas
                        adicionais, entre em contato conosco. Estamos aqui para
                        ajudar e responderemos em até 1 dia útil.
                    </p>
                </div>
            </div>
        </>
    );
}
