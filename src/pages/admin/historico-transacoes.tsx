import styles from '@/styles/HistoricoTransacoes.module.scss';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { db } from '@/lib/firebaseClient';
import { collection, getDoc, getDocs } from 'firebase/firestore';

import DashboardLayout from '@/layouts/DashboardLayout';
import { NextPageWithLayout } from '@/pages/_app';
import { ReactElement } from 'react';

interface UserData {
    name: string;
    cpf: string;
    phone: string;
    email: string;
    birthdate: string;
    savedEvents: string[];
}

interface PaymentData {
    userId: any;
    status: string;
    dateCreated: string;
    dateApproved: string;
    fees: {
        amount: number;
        type: string;
    };
    moneyReleasedDate: string;
    method: {
        id: string;
        type: string;
    };
    transactionAmount: number;
    ticketId: string;
    eventId: any;
    gateway: string;
    gatewayId: string;
    comprador: string;
    custosVenda: number;
    totalVenda: number;
    aprovado: string;
    precoVenda: number;
    numeroPedido: string;
    dataVenda: string;
}

const HistoricoTransacoes: NextPageWithLayout = () => {
    const [pagamentos, setPagamentos] = useState<PaymentData[]>([]);
    const eventId = 'ursUJZjj3JN6zQZOVlvJ';

    const [totalPrecoVenda, setTotalPrecoVenda] = useState(0);
    const [totalCustosVenda, setTotalCustosVenda] = useState(0);
    const [totalVenda, setTotalVenda] = useState(0);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                let localTotalPrecoVenda = 0;
                let localTotalCustosVenda = 0;
                let localTotalVenda = 0;

                const querySnapshot = await getDocs(collection(db, 'payments'));
                const pagamentosTemp: PaymentData[] = [];

                for (const doc of querySnapshot.docs) {
                    const paymentData = doc.data() as PaymentData;

                    if (
                        paymentData.eventId &&
                        paymentData.eventId.path.includes(eventId)
                    ) {
                        let comprador = '';
                        if (paymentData.userId) {
                            const userDoc = await getDoc(paymentData.userId);
                            if (userDoc.exists()) {
                                const userData = userDoc.data() as UserData;
                                comprador = userData.name;
                            }
                        }

                        const dataVenda = paymentData.moneyReleasedDate;
                        const numeroPedido = 'a1'; // Substitua conforme necessário
                        const precoVenda = paymentData.transactionAmount;
                        const custosVenda =
                            paymentData.transactionAmount +
                            paymentData.fees.amount;
                        const totalVenda =
                            paymentData.transactionAmount -
                            paymentData.fees.amount;
                        const aprovado =
                            paymentData.status === 'approved'
                                ? 'Sim'
                                : paymentData.status === 'processing'
                                  ? 'Processando'
                                  : 'Não';

                        pagamentosTemp.push({
                            ...paymentData,
                            comprador,
                            custosVenda,
                            totalVenda,
                            aprovado,
                            precoVenda,
                            numeroPedido,
                            dataVenda,
                        });

                        localTotalPrecoVenda += precoVenda;
                        localTotalCustosVenda += custosVenda;
                        localTotalVenda += totalVenda;
                    }
                }

                setPagamentos(pagamentosTemp);
                setTotalPrecoVenda(Number(localTotalPrecoVenda));
                setTotalCustosVenda(Number(localTotalCustosVenda));
                setTotalVenda(Number(localTotalVenda));
            } catch (error) {
                console.error('Erro ao acessar a coleção PAYMENT:', error);
            }
        };

        fetchPayments();
    }, [eventId]);

    const [participantes, setParticipantes] = useState(pagamentos);
    const [statusTransacao, setStatusTransacao] = useState('aprovadas');
    const [resultadosFiltrados, setResultadosFiltrados] =
        useState(participantes);

    useEffect(() => {
        let filtrados = pagamentos;

        if (statusTransacao === 'aprovadas') {
            filtrados = filtrados.filter(
                (participante) => participante.aprovado === 'Sim'
            );
        } else if (statusTransacao === 'reprovadas') {
            filtrados = filtrados.filter(
                (participante) => participante.aprovado === 'Não'
            );
        }

        setResultadosFiltrados(filtrados);
    }, [statusTransacao, participantes]);

    return (
        <main className={styles.container}>
            <div className={styles.contentArea}>
                <div className={styles.allContent}>
                    <div className={styles.safeArea}>
                        <div className={styles.Head}>
                            <div className={styles.leftHead}>
                                <img
                                    src="/greenCircle.svg"
                                    alt=""
                                    className={styles.greenCircle}
                                />
                                <p className={styles.title}>1001 Ingressos</p>
                                <img src="/Link.svg" alt="" />
                            </div>

                            <div className={styles.rightHead}>
                                <button className={styles.headButton}>
                                    EDITAR EVENTO
                                </button>
                                <button className={styles.headButton}>
                                    EXPORTAR BORDERÔ
                                </button>
                            </div>
                        </div>

                        <div className={styles.Data}>
                            <div className={styles.dataArea}>
                                <img src="/Calendar.svg" alt="" />
                                <p className={styles.dataValue}>
                                    Quarta, 08/11/2023, 10h – Sexta, 10/11/2023,
                                    10h{' '}
                                </p>
                            </div>

                            <div className={styles.dataArea}>
                                <img src="/local.svg" alt="" />

                                <p className={styles.dataValue}>
                                    Local a definir, Curitiba, PR
                                </p>
                            </div>
                        </div>

                        <div className={styles.Nav}>
                            <Link href={'/admin/visao-geral-transacoes'}>
                                <p className={styles.navItem}>VISÃO GERAL</p>
                            </Link>
                            {/* <p className={styles.navItemActive}>
                                HISTÓRICO DAS TRANSAÇÕES
                            </p> */}
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.participantsData}>
                            {/* <p className={styles.resumeTitle}>
                                HISTÓRICO DAS TRANSAÇÕES
                            </p> */}
                            <p className={styles.selectTitle}>
                                Filtrar por tipo de transação
                            </p>

                            <select
                                name="statusTransacao"
                                id="statusTransacao"
                                className={styles.selectField}
                                value={statusTransacao}
                                onChange={(e) =>
                                    setStatusTransacao(e.target.value)
                                }
                            >
                                <option value="todas">
                                    Todas as transações
                                </option>
                                <option value="aprovadas">
                                    Todas as transações aprovadas
                                </option>
                                <option value="reprovadas">
                                    Todas as transações reprovadas
                                </option>
                            </select>

                            <div className={styles.tableContainer}>
                                <div className={styles.headTable}>
                                    <p className={styles.tableTitle}>
                                        Nº DO PEDIDO
                                    </p>
                                    <p className={styles.tableTitle}>
                                        COMPRADOR
                                    </p>
                                    <p className={styles.tableTitle}>
                                        DATA DA VENDA
                                    </p>
                                    <p className={styles.tableTitle}>
                                        PREÇO DA VENDA
                                    </p>
                                    <p className={styles.tableTitle}>
                                        CUSTOS DA VENDA
                                    </p>
                                    <p className={styles.tableTitle}>
                                        TOTAL DA VENDA
                                    </p>
                                </div>
                            </div>

                            {resultadosFiltrados.length > 0 ? (
                                resultadosFiltrados.map((venda, index) => (
                                    <div
                                        className={styles.tableContainer}
                                        key={index}
                                    >
                                        <div className={styles.Table}>
                                            <p className={styles.tableItem}>
                                                {venda.numeroPedido}
                                            </p>
                                            <p className={styles.tableItem}>
                                                {venda.comprador}
                                            </p>
                                            <p className={styles.tableItem}>
                                                {venda.dataVenda}
                                            </p>
                                            <p className={styles.tableItem}>
                                                {venda.precoVenda}
                                            </p>
                                            <p className={styles.tableItem}>
                                                {venda.custosVenda}
                                            </p>
                                            <p className={styles.tableItem}>
                                                {venda.totalVenda}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.tableContainer}>
                                    <div className={styles.Table}>
                                        <p className={styles.tableItem}>
                                            Nenhum participante encontrado.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className={styles.tableContainer}>
                                <div className={styles.headTable}>
                                    <p className={styles.tableTitle}>-</p>
                                    <p className={styles.tableTitle}>-</p>
                                    <p className={styles.tableTitle}>TOTAL</p>
                                    <p className={styles.tableTitle}>
                                        {totalPrecoVenda.toFixed(2)}
                                    </p>
                                    <p className={styles.tableTitle}>
                                        {totalCustosVenda.toFixed(2)}
                                    </p>
                                    <p className={styles.tableTitle}>
                                        {totalVenda.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

HistoricoTransacoes.getLayout = function getLayout(page: ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};

export default HistoricoTransacoes;
