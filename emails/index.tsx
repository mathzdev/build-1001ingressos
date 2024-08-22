import {
    Body,
    Column,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from '@react-email/components';

interface EmailProps {
    qrCode: string;
    eventBannerUrl: string;
    eventName: string;
    name: string;
    eventPlace: string;
    ticketBatch: string;
    ticketCode: string;
    eventDate: string;
    eventTime: string;
    ticketUrl: string;
}

export default function Email({
    qrCode,
    eventBannerUrl,
    eventName,
    name,
    eventPlace,
    ticketBatch,
    ticketCode,
    eventDate,
    eventTime,
    ticketUrl,
}: EmailProps) {
    const firstName = name?.split(' ')[0];
    return (
        <Html>
            <Head />
            <Preview>Chegou seu ingresso para o evento {eventName}!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Img
                            src="https://static.1001ingressos.com.br/logo.png"
                            width="146"
                            alt="1001 Ingressos"
                            style={logo}
                        />
                        <Text style={title}>
                            Oi {firstName}, seu ingresso para o evento{' '}
                            <strong>{eventName}</strong> acabou de chegar!
                        </Text>
                    </Section>
                    <Section style={banner}>
                        <Img width="100%" src={eventBannerUrl} />
                    </Section>

                    <Section style={ticketContainerHeader}>
                        <Heading as="h2" style={ticketTitle}>
                            {eventName}
                        </Heading>
                    </Section>
                    <Section style={divider}></Section>
                    <Section style={ticketContainerBody}>
                        <Section style={qrCodeContainer}>
                            <Img width="100%" src="cid:qrCode" />
                        </Section>

                        <Section>
                            <Row style={ticketInfoRow}>
                                <Column style={infoItem}>
                                    <Text style={infoItemLabelLeft}>Nome</Text>
                                    <Text style={infoItemValueLeft}>
                                        {name}
                                    </Text>
                                </Column>
                                <Column style={infoItem}>
                                    <Text style={infoItemLabelRight}>
                                        Local
                                    </Text>
                                    <Text style={infoItemValueRight}>
                                        {eventPlace}
                                    </Text>
                                </Column>
                            </Row>
                            <Row style={ticketInfoRow}>
                                <Column style={infoItem}>
                                    <Text style={infoItemLabelLeft}>
                                        Ingresso
                                    </Text>
                                    <Text style={infoItemValueLeft}>
                                        {ticketBatch}
                                    </Text>
                                </Column>
                                <Column style={infoItem}>
                                    <Text style={infoItemLabelRight}>
                                        Código
                                    </Text>
                                    <Text style={infoItemValueRight}>
                                        {ticketCode}
                                    </Text>
                                </Column>
                            </Row>
                            <Row style={ticketInfoRow}>
                                <Column style={infoItem}>
                                    <Text style={infoItemLabelLeft}>Data</Text>
                                    <Text style={infoItemValueLeft}>
                                        {eventDate}
                                    </Text>
                                </Column>
                                <Column style={infoItem}>
                                    <Text style={infoItemLabelRight}>Hora</Text>
                                    <Text style={infoItemValueRight}>
                                        {eventTime}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>
                    </Section>
                    <Section style={buttonContainer}>
                        <Link style={button} href={ticketUrl}>
                            Ver ingresso
                        </Link>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#ffffff',
    fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
    padding: '32px',
};

const title = {
    margin: '0 0 32px',
    fontSize: '21px',
    lineHeight: '21px',
    color: '#000',
    textAlign: 'center' as const,
};
const ticketTitle = {
    margin: '0',
    fontWeight: 'bold',
    fontSize: '18px',
    lineHeight: '18px',
    color: '#000',
    textAlign: 'center' as const,
};

const divider = {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '425px',
    height: '8px',
    backgroundColor: '#fff',
    backgroundImage: `url("cid:dottedLine")`,
    backgroundRepeat: 'repeat-x',
    backgroundPosition: 'center',
    display: 'block',
    overflow: 'hidden',
    border: '1.5px solid rgba(0, 0, 0, 0.10)',
    borderTop: 'none',
    borderBottom: 'none',
};

const container = {
    maxWidth: '680px',
    width: '100%',
    margin: '0 auto',
    backgroundColor: '#ffffff',
};

const ticketContainerHeader = {
    width: '100%',
    aspectRatio: '73 / 15',
    maxWidth: '425px',
    backgroundColor: '#fff',
    color: '#262626',
    padding: '20px 20px 16px',
    borderRadius: '10px 10px 0 0',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.25)',
    border: '1.5px solid rgba(0, 0, 0, 0.10)',
    borderBottom: 'none',
};

const ticketContainerBody = {
    width: '100%',
    aspectRatio: '73 / 79',
    maxWidth: '425px',
    backgroundColor: '#fff',
    color: '#262626',
    padding: '16px 20px 20px',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.25)',
    border: '1.5px solid rgba(0, 0, 0, 0.10)',
    borderTop: 'none',
};

const ticketInfoRow = {
    marginTop: '20px',
};

const infoItem = {
    width: '50%',
};

const infoItemLabelLeft = {
    color: '#262626',
    fontSize: '10px',
    lineHeight: '10px',
    fontWeight: '400',
    textTransform: 'capitalize' as const,
    margin: '0',
    marginBottom: '10px',
};

const infoItemLabelRight = {
    color: '#262626',
    fontSize: '10px',
    lineHeight: '10px',
    fontWeight: '400',
    textTransform: 'capitalize' as const,
    textAlign: 'right' as const,
    margin: '0',
    marginBottom: '10px',
};

const infoItemValueLeft = {
    color: '#262626',
    fontSize: '14px',
    lineHeight: '14px',
    fontWeight: '700',
    margin: '0',
};
const infoItemValueRight = {
    color: '#262626',
    fontSize: '14px',
    lineHeight: '14px',
    fontWeight: '700',
    textAlign: 'right' as const,
    margin: '0',
};

const header = {
    display: 'flex',
    background: '#fff',
    width: '100%',
    maxWidth: '600px',
};

const logo = {
    margin: '0 auto',
    marginBottom: '12px',
};

const banner = {
    borderRadius: '10px',
    marginBottom: '16px',
    width: '100%',
    maxWidth: '425px',
};
const qrCodeContainer = {
    width: '100%',
    aspectRatio: '1 / 1',
    maxWidth: '80%',
    margin: '0 auto',
};

const buttonContainer = {
    marginTop: '32px',
    marginBottom: '32px',
    width: '100%',
    textAlign: 'center' as const,
};

const button = {
    backgroundImage: 'linear-gradient(270deg, #A31BE1 -4.42%, #FF3FE0 90.18%)',
    fontSize: '17px',
    lineHeight: '17px',
    padding: '13px 17px',
    borderRadius: '12px',
    maxWidth: '120px',
    margin: '0 auto',
    color: '#fff',
};
