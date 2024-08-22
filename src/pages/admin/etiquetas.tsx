import Header from '@/components/admin/Header';
import SidebarNav from '@/components/admin/SidebarNav';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../../styles/Etiquetas.module.scss';
export default function Etiquetas() {
    const [linha1, setLinha1] = useState('');
    const [linha2, setLinha2] = useState('');
    const [linha3, setLinha3] = useState('');

    return (
        <section className={styles.container}>
            <div className={styles.headerArea}>
                <Header></Header>
            </div>

            <div className={styles.contentArea}>
                <div className={styles.sidebar}>
                    <SidebarNav></SidebarNav>
                </div>

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
                                    EXPORTAR PARTICIPANTES
                                </button>
                                <button className={styles.headButton}>
                                    IMPRIMIR LISTA
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
                            <Link href={'/admin/visao-geral'}>
                                <p className={styles.navItem}>VISÃO GERAL</p>
                            </Link>
                            <Link href={'/check-in-online'}>
                                <p className={styles.navItem}>
                                    CHECK-IN ONLINE
                                </p>
                            </Link>
                            <Link href={'/check-in-scanner'}>
                                <p className={styles.navItem}>
                                    CHECK-IN VIA SCANNER
                                </p>
                            </Link>
                            <p className={styles.navItemActive}>ETIQUETAS</p>
                        </div>
                    </div>

                    <div className={styles.contentTop}>
                        <div className={styles.participantsData}>
                            <p className={styles.resumeTitle}>
                                CONFIGURAR ETIQUETAS
                            </p>

                            <p className={styles.ticketTitle}>
                                Selecione os campos que devem preencher cada
                                etiqueta:
                            </p>

                            <div className={styles.contentInputs}>
                                <div className={styles.leftInputs}>
                                    <div className={styles.inputContainer}>
                                        <p className={styles.inputTitle}>
                                            Linha 1
                                        </p>
                                        <input
                                            type="text"
                                            placeholder="Nome Sobrenome"
                                            className={styles.inputField}
                                            value={linha1}
                                            onChange={(e) =>
                                                setLinha1(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className={styles.inputContainer}>
                                        <p className={styles.inputTitle}>
                                            Linha 2
                                        </p>
                                        <input
                                            type="text"
                                            placeholder=""
                                            className={styles.inputField}
                                            value={linha2}
                                            onChange={(e) =>
                                                setLinha2(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className={styles.inputContainer}>
                                        <p className={styles.inputTitle}>
                                            Linha 3
                                        </p>
                                        <input
                                            type="text"
                                            placeholder="Código de barras"
                                            className={styles.inputField}
                                            value={linha3}
                                            onChange={(e) =>
                                                setLinha3(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className={styles.rightInputs}>
                                    <div className={styles.dataContainer}>
                                        <input
                                            type="text"
                                            readOnly
                                            value={linha1}
                                            className={styles.dataField}
                                            placeholder="Nome Sobrenome"
                                        />
                                    </div>
                                    <div className={styles.dataContainer}>
                                        <input
                                            type="text"
                                            readOnly
                                            value={linha2}
                                            className={styles.dataField}
                                            placeholder="[Linha 2]"
                                        />
                                    </div>

                                    <div className={styles.barContainer}>
                                        <img src="/barcode.svg" alt="" />
                                        <input
                                            type="number"
                                            readOnly
                                            value={linha3}
                                            className={styles.barField}
                                            placeholder="Código de barras"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.participantsData}>
                            <p className={styles.resumeTitle}>
                                DEFINIR MÉTODO E FORMATO DE IMPRESSÃO
                            </p>

                            <div className={styles.contentInputs}>
                                <div className={styles.leftInputs}>
                                    <p className={styles.printTitle}>
                                        Pré impressão
                                    </p>

                                    <div className={styles.text}>
                                        <img src="/point.svg" alt="" />
                                        <p className={styles.flowDesc}>
                                            Etiquetas geradas com antecedência
                                            ao início do evento
                                        </p>
                                    </div>

                                    <div className={styles.text}>
                                        <img src="/point.svg" alt="" />
                                        <p className={styles.flowDesc}>
                                            Podem ser impressas em impressoras
                                            comuns ou em impressoras térmicas de
                                            etiquetas
                                        </p>
                                    </div>

                                    <div className={styles.text}>
                                        <img src="/point.svg" alt="" />
                                        <p className={styles.flowDesc}>
                                            Requer papel próprio de etiquetas
                                        </p>
                                    </div>

                                    <p className={styles.ticketTitle}>
                                        Selecione o formato de impressão
                                    </p>

                                    <div className={styles.textRadio}>
                                        <input type="radio" />
                                        <p className={styles.flowDesc}>
                                            Impressora comum + papel de
                                            etiquetas A4, 10 por folha
                                        </p>
                                        <img src="/span.svg" alt="" />
                                    </div>

                                    <div className={styles.textRadio}>
                                        <input type="radio" />
                                        <p className={styles.flowDesc}>
                                            Impressora comum + papel de
                                            etiquetas A4, 16 por folha
                                        </p>
                                        <img src="/span.svg" alt="" />
                                    </div>

                                    <div className={styles.textRadio}>
                                        <input type="radio" />
                                        <p className={styles.flowDesc}>
                                            Impressora comum + papel de
                                            etiquetas A4, 18 por folha
                                        </p>
                                        <img src="/span.svg" alt="" />
                                    </div>

                                    <div className={styles.textRadio}>
                                        <input type="radio" />
                                        <p className={styles.flowDesc}>
                                            Impressora comum + papel de
                                            etiquetas A4, 21 por folha
                                        </p>
                                        <img src="/span.svg" alt="" />
                                    </div>

                                    <div className={styles.textRadio}>
                                        <input type="radio" />
                                        <p className={styles.flowDesc}>
                                            Impressora térmica de etiquetas +
                                            papel Brother DK1201
                                        </p>
                                        <img src="/span.svg" alt="" />
                                    </div>

                                    <p className={styles.ticketTitle}>
                                        Selecione os participantes
                                    </p>

                                    <select
                                        className={styles.inputField}
                                        name="tipoParticipante"
                                        id="tipoParticipante"
                                    >
                                        <option value="">
                                            Selecione o Tipo de Participante
                                        </option>
                                        <option value="convidado">
                                            Convidado
                                        </option>
                                        <option value="vip">VIP</option>
                                        <option value="palestrante">
                                            Palestrante
                                        </option>
                                        <option value="organizador">
                                            Organizador
                                        </option>
                                        <option value="voluntario">
                                            Voluntário
                                        </option>
                                        <option value="patrocinador">
                                            Patrocinador
                                        </option>
                                    </select>

                                    <button className={styles.createButton}>
                                        GERAR ETIQUETA
                                    </button>
                                </div>

                                <div className={styles.rightInputs}>
                                    <p className={styles.printTitle}>
                                        Impressão durante credenciamento
                                    </p>

                                    <div className={styles.text}>
                                        <img src="/point.svg" alt="" />
                                        <p className={styles.flowDesc}>
                                            Etiquetas geradas individualmente no
                                            momento do credenciamento
                                        </p>
                                    </div>

                                    <div className={styles.text}>
                                        <img src="/point.svg" alt="" />
                                        <p className={styles.flowDesc}>
                                            Requer impressora térmica de
                                            etiquetas
                                        </p>
                                    </div>

                                    <div className={styles.text}>
                                        <img src="/point.svg" alt="" />
                                        <p className={styles.flowDesc}>
                                            Requer papel próprio de etiquetas
                                        </p>
                                    </div>

                                    <div className={styles.textRadio}>
                                        <input type="radio" />
                                        <p className={styles.flowDesc}>
                                            Habilitar impressão individual de
                                            etiquetas na ferramenta de check-in
                                            online
                                        </p>
                                        <img src="/span.svg" alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
