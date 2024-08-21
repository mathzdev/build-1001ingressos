import styles from '@/styles/GraficosMobile.module.scss';
import dynamic from 'next/dynamic';

import { Cell, Pie } from 'recharts';
const PieChart = dynamic(
    () => import('recharts').then((recharts) => recharts.PieChart),
    {
        ssr: false,
    }
);

const data = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function MeusEventosMobile() {
    return (
        <>
            <div className={styles.container}>
                <img src="/qr.svg" alt="" className={styles.qr} />

                <div className={styles.headContent}>
                    <div className={styles.topHead}>
                        <img src="/back.svg" alt="" />
                        <p className={styles.Title}>On Fire! com MC DAVI</p>
                        <img src="/filter.svg" alt="" />
                    </div>
                </div>

                <div className={styles.nav}>
                    <span>Total</span>
                    <p>Ultimos 7 dias</p>
                    <p>Hoje</p>
                </div>

                <div className={styles.bodyContent}>
                    <p className={styles.bodyTitle}>
                        Atualizado em 12/11/2023 às 11:58
                    </p>
                    <p className={styles.TitleV}>R$ 5.045,49</p>
                    <p className={styles.bodyTitle}>TOTAL VENDIDO </p>

                    <PieChart
                        width={400}
                        height={400}
                        className={styles.grafico}
                    >
                        <Pie
                            data={data}
                            cx={120}
                            cy={200}
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                    </PieChart>

                    <div className={styles.tableContent}>
                        <div className={styles.headTable}>
                            <p className={styles.descTable}>TIPO DE INGRESSO</p>
                            <div className={styles.rightTable}>
                                <p className={styles.descTable}>Qtde</p>
                            </div>
                        </div>
                        <div className={styles.bodyTable}>
                            <p className={styles.descTable}>
                                Open bar até 00h00 + Entrada - Feminino
                            </p>
                            <div className={styles.rightBTable}>
                                <p className={styles.descTable}>40</p>
                            </div>
                        </div>
                        <div className={styles.bodyTable}>
                            <p className={styles.descTable}>
                                Open bar até 00h00 + Entrada - Feminino
                            </p>
                            <div className={styles.rightBTable}>
                                <p className={styles.descTable}>40</p>
                            </div>
                        </div>
                        <div className={styles.bodyTable}>
                            <p className={styles.descTable}>
                                Open bar até 00h00 + Entrada - Feminino
                            </p>
                            <div className={styles.rightBTable}>
                                <p className={styles.descTable}>40</p>
                            </div>
                        </div>
                        <div className={styles.bodyTable}>
                            <p className={styles.descTable}>
                                Open bar até 00h00 + Entrada - Feminino
                            </p>
                            <div className={styles.rightBTable}>
                                <p className={styles.descTable}>40</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
