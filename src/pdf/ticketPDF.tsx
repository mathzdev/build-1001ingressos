import {
    Document,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        paddingTop: 35,
        paddingBottom: 65,
        paddingHorizontal: 35,
    },
    title: {
        margin: 0,
        fontSize: 21,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#000',
    },
    ticketTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        color: '#000',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        border: '1px solid #50525f',
        borderRadius: 10,
    },
    ticketInfo: {
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    image: {
        marginVertical: 15,
        marginHorizontal: 10,
    },
    imageQRCode: {
        marginHorizontal: 'auto',
        marginBottom: 10,
        height: 150,
        width: 150,
    },
    text: {
        color: '#262626',
        fontSize: 14,
        margin: 2,
        maxWidth: '50%',
    },
    logo: {
        height: 80,
        width: 80,
        marginHorizontal: 'auto',
    },
});

interface TicketPDFProps {
    tickets: {
        qrCode: string;
        eventBannerUrl: string;
        eventName: string;
        name: string;
        eventPlace: string;
        ticketBatch: string;
        ticketCode: string;
        eventDate: string;
        eventTime: string;
    }[];
    logoUrl: string;
}

const TicketPDF = ({ tickets, logoUrl }: TicketPDFProps) => {
    return (
        <Document>
            {tickets.map((ticket) => (
                <Page style={styles.page} key={ticket.ticketCode}>
                    <View style={styles.section}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image
                            style={styles.image}
                            src={ticket.eventBannerUrl}
                        />
                        <Text style={styles.title}>{ticket.eventName}</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.ticketInfo}>
                            <Text style={styles.text}>Nome: {ticket.name}</Text>
                            <Text style={styles.text}>
                                Ingresso: {ticket.ticketBatch}
                            </Text>
                            <Text style={styles.text}>
                                Local: {ticket.eventPlace}
                            </Text>
                            <Text style={styles.text}>
                                Data: {ticket.eventDate}
                            </Text>
                            <Text style={styles.text}>
                                Hora: {ticket.eventTime}
                            </Text>
                        </View>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <View style={styles.section}>
                            <Image
                                style={styles.imageQRCode}
                                src={ticket.qrCode}
                            />
                            <Text>{ticket.ticketCode}</Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image style={styles.logo} src={logoUrl} />
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export default TicketPDF;
